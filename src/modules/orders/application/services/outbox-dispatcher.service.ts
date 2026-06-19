import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { OrdersOutboxPort } from '../../ports/outbound/orders-outbox.port';
import { OrdersRepositoryPort } from '../../ports/outbound/orders-repository.port';
import { OrdersStoragePort } from '../../ports/outbound/orders-storage.port';
import { OrdersQueuePort } from '../../ports/outbound/orders-queue.port';
import { ORDERS_OUTBOX_PORT, ORDERS_QUEUE_PORT, ORDERS_REPOSITORY, ORDERS_STORAGE_PORT } from '../../orders.tokens';
import { ExternalServiceException } from '../exceptions/external-service.exception';

@Injectable()
export class OrderOutboxDispatcherService {
  private readonly logger = new Logger(OrderOutboxDispatcherService.name);
  private readonly maxAttempts = 5;

  constructor(
    @Inject(ORDERS_OUTBOX_PORT)
    private readonly outbox: OrdersOutboxPort,
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: OrdersRepositoryPort,
    @Inject(ORDERS_STORAGE_PORT)
    private readonly storage: OrdersStoragePort,
    @Inject(ORDERS_QUEUE_PORT)
    private readonly queue: OrdersQueuePort,
  ) {}

  @Interval(5000)
  async dispatch(): Promise<void> {
    const record = await this.outbox.claimNext();
    if (!record) {
      return;
    }

    try {
      const order = await this.ordersRepository.findById(record.orderId);
      if (!order) {
        throw new ExternalServiceException('Outbox', `Order ${record.orderId} not found for outbox dispatch`);
      }

      await this.storage.uploadOrderSnapshot(order);
      await this.queue.enqueueOrderCreated({
        orderId: order.id,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
      });

      await this.outbox.markProcessed(record.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const attempts = record.attempts + 1;
      if (attempts >= this.maxAttempts) {
        this.logger.error(`Outbox ${record.id} failed permanently after ${attempts} attempts: ${message}`);
        await this.outbox.markFailed(record.id, message, attempts, 'FAILED');
        return;
      }

      this.logger.warn(`Outbox ${record.id} failed attempt ${attempts}: ${message}`);
      await this.outbox.markFailed(record.id, message, attempts, 'PENDING');
    }
  }
}
