import { Logger } from '@nestjs/common';
import { InjectQueue, OnQueueFailed, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { ORDERS_DLQ, ORDERS_QUEUE } from '../../../orders.tokens';
import { OrderCreatedJob } from '../../../ports/outbound/orders-queue.port';

@Processor(ORDERS_QUEUE)
export class OrdersQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(OrdersQueueConsumer.name);

  constructor(@InjectQueue(ORDERS_DLQ) private readonly dlq: Queue) {
    super();
  }

  async process(job: Job<OrderCreatedJob>): Promise<void> {
    try {
      this.logger.log(`Processing order job ${job.id}`);
      this.logger.debug(`Payload: ${JSON.stringify(job.data)}`);
      // Add domain-specific processing here.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Order job ${job.id} failed: ${message}`);
      throw error;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job<OrderCreatedJob>, error: Error): Promise<void> {
    this.logger.error(`Order job ${job.id} moved to DLQ: ${error.message}`);
    await this.dlq.add('orders.dlq', { jobId: job.id, payload: job.data, error: error.message }, { removeOnComplete: true });
  }
}
