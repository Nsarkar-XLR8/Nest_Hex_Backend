import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrdersQueuePort, OrderCreatedJob } from '../../../ports/outbound/orders-queue.port';
import { ExternalServiceException } from '../../../application/exceptions/external-service.exception';
import { ORDERS_QUEUE } from '../../../orders.tokens';

@Injectable()
export class OrdersQueueAdapter implements OrdersQueuePort {
  constructor(@InjectQueue(ORDERS_QUEUE) private readonly queue: Queue) {}

  async enqueueOrderCreated(payload: OrderCreatedJob): Promise<void> {
    try {
      await this.queue.add('order.created', payload, {
        jobId: payload.orderId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ExternalServiceException('BullMQ', 'Failed to enqueue order event', {
        message,
      });
    }
  }
}
