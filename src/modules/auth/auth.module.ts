import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './adapters/inbound/auth.controller';
import { AuthService } from './application/services/auth.service';
import { AUTH_ATTEMPTS_PORT, AUTH_SERVICE, EMAIL_PORT, EMAIL_VERIFICATION_PORT, PASSWORD_BREACH_PORT, REFRESH_TOKEN_PORT, TOKEN_PORT } from './auth.tokens';
import { SmtpEmailAdapter } from './adapters/outbound/email/smtp-email.adapter';
import { JwtTokenAdapter } from './adapters/outbound/jwt/jwt-token.adapter';
import { JwtStrategy } from './adapters/outbound/jwt/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { Env } from '../../config/env.schema';
import { RedisEmailVerificationAdapter } from './adapters/outbound/redis/email-verification-redis.adapter';
import { RedisRefreshTokenAdapter } from './adapters/outbound/redis/refresh-token-redis.adapter';
import { RedisAuthAttemptsAdapter } from './adapters/outbound/redis/auth-attempts-redis.adapter';
import { LocalPasswordBreachAdapter } from './adapters/outbound/password-breach/local-password-breach.adapter';
import { AuditLogService } from '../../common/providers/audit-log.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: EMAIL_PORT,
      useClass: SmtpEmailAdapter,
    },
    {
      provide: EMAIL_VERIFICATION_PORT,
      useClass: RedisEmailVerificationAdapter,
    },
    {
      provide: REFRESH_TOKEN_PORT,
      useClass: RedisRefreshTokenAdapter,
    },
    {
      provide: AUTH_ATTEMPTS_PORT,
      useClass: RedisAuthAttemptsAdapter,
    },
    {
      provide: PASSWORD_BREACH_PORT,
      useClass: LocalPasswordBreachAdapter,
    },
    AuditLogService,
    {
      provide: TOKEN_PORT,
      useClass: JwtTokenAdapter,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
