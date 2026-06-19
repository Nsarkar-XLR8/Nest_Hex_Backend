import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { S3HealthIndicator } from './indicators/s3.health';
import { BullMqHealthIndicator } from './indicators/bullmq.health';
import { ORDERS_QUEUE } from '../../modules/orders/orders.tokens';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({ name: ORDERS_QUEUE }),
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, S3HealthIndicator, BullMqHealthIndicator],
})
export class HealthModule {}
