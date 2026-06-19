import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Env } from './config/env.schema';
import { requestIdMiddleware } from './common/interceptors/request-id.middleware';
import { startTracing } from './common/telemetry/tracing';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const logger = new Logger('Bootstrap');

  if (config.get('OTEL_ENABLED', { infer: true })) {
    await startTracing(
      config.get('SERVICE_NAME', { infer: true }),
      config.get('OTEL_EXPORTER_OTLP_ENDPOINT', { infer: true }),
    );
  }

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
        },
      },
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const openApiBuilder = new DocumentBuilder()
    .setTitle('Nest Hex Backend')
    .setDescription('Enterprise NestJS DDD + Hexagonal Architecture')
    .setVersion('1.0.0')
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'httpBasic')
    .addBearerAuth()
    .addServer('/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, openApiBuilder);
  const openApiPath = config.get('OPENAPI_JSON_PATH', { infer: true });
  const apiReferencePath = config.get('API_REFERENCE_PATH', { infer: true });

  app.use(openApiPath, (_req, res) => res.json(document));

  app.use(
    apiReferencePath,
    apiReference({
      url: openApiPath,
      authentication: {
        preferredSecurityScheme: 'httpBasic',
        securitySchemes: {
          httpBasic: {
            username: config.get('SCALAR_USERNAME', { infer: true }),
            password: config.get('SCALAR_PASSWORD', { infer: true }),
          },
        },
      },
    }),
  );

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  logger.log(`HTTP server listening on port ${port}`);
}

bootstrap();
