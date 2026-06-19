import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { RedisHealthIndicator } from './indicators/redis.health';
import { S3HealthIndicator } from './indicators/s3.health';
import { BullMqHealthIndicator } from './indicators/bullmq.health';
import { buildResponse, createLink } from '../hateoas/hateoas';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly s3: S3HealthIndicator,
    private readonly bullmq: BullMqHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  async liveness() {
    const data = await this.health.check([
      () => this.mongoose.pingCheck('mongo'),
    ]);

    return buildResponse(data, [createLink({ rel: 'self', href: '/api/v1/health/live', method: 'GET' })]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness() {
    const data = await this.health.check([
      () => this.mongoose.pingCheck('mongo'),
      () => this.redis.isHealthy('redis'),
      () => this.s3.isHealthy('s3'),
      () => this.bullmq.isHealthy('bullmq'),
    ]);

    return buildResponse(data, [createLink({ rel: 'self', href: '/api/v1/health/ready', method: 'GET' })]);
  }
}
