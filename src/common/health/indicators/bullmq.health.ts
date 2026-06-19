import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORDERS_QUEUE } from '../../modules/orders/orders.tokens';

@Injectable()
export class BullMqHealthIndicator extends HealthIndicator {
  constructor(@InjectQueue(ORDERS_QUEUE) private readonly queue: Queue) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.queue.isReady();
      return this.getStatus(key, true);
    } catch (error) {
      const health = this.getStatus(key, false);
      throw new HealthCheckError('BullMQ health check failed', health);
    }
  }
}
