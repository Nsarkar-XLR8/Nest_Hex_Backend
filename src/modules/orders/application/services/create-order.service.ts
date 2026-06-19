import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CreateOrderCommand, CreateOrderResult, CreateOrderUseCase } from '../../ports/inbound/create-order.usecase';
import { OrdersRepositoryPort } from '../../ports/outbound/orders-repository.port';
import { OrdersOutboxPort } from '../../ports/outbound/orders-outbox.port';
import { IdempotencyPort } from '../../ports/outbound/idempotency.port';
import { Order } from '../../domain/models/order';
import { OrderItem } from '../../domain/models/order-item';
import { UNIT_OF_WORK } from '../../../../common/constants';
import { UnitOfWorkPort } from '../../../../common/ports/unit-of-work.port';
import { IdempotencyKeyConflictException } from '../exceptions/idempotency-key-conflict.exception';
import { Env } from '../../../../config/env.schema';
import {
  CREATE_ORDER_USE_CASE,
  IDEMPOTENCY_PORT,
  ORDERS_OUTBOX_PORT,
  ORDERS_REPOSITORY,
} from '../../orders.tokens';

@Injectable()
export class CreateOrderService implements CreateOrderUseCase {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: OrdersRepositoryPort,
    @Inject(ORDERS_OUTBOX_PORT)
    private readonly outbox: OrdersOutboxPort,
    @Inject(IDEMPOTENCY_PORT)
    private readonly idempotency: IdempotencyPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const ttlSeconds = this.config.get('IDEMPOTENCY_TTL_SECONDS', { infer: true });
    const acquired = await this.idempotency.tryAcquire(command.idempotencyKey, ttlSeconds);

    if (!acquired) {
      throw new IdempotencyKeyConflictException(command.idempotencyKey);
    }

    try {
      const order = await this.unitOfWork.withTransaction(async (context) => {
        const orderItems = command.items.map((item) =>
          OrderItem.create(item.sku, item.quantity, item.unitPrice),
        );

        const newOrder = Order.create({
          id: randomUUID(),
          customerId: command.customerId,
          items: orderItems,
        });

        await this.ordersRepository.save(newOrder, {
          session: context.getSession(),
        });
        await this.outbox.create(newOrder.id, {
          session: context.getSession(),
        });

        return newOrder;
      });

      return { orderId: order.id };
    } catch (error) {
      await this.idempotency.release(command.idempotencyKey);
      throw error;
    }
  }
}

export const createOrderUseCaseProvider = {
  provide: CREATE_ORDER_USE_CASE,
  useClass: CreateOrderService,
};
