import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { OrderEntity, OrderSchema } from './adapters/outbound/mongoose/order.schema';
import { OrdersRepositoryAdapter } from './adapters/outbound/mongoose/orders.repository';
import { OrderOutboxEntity, OrderOutboxSchema } from './adapters/outbound/mongoose/outbox.schema';
import { OrdersOutboxRepositoryAdapter } from './adapters/outbound/mongoose/orders-outbox.repository';
import { OrdersS3Adapter } from './adapters/outbound/s3/orders-s3.adapter';
import { OrdersQueueAdapter } from './adapters/outbound/bullmq/orders-queue.adapter';
import { OrdersQueueConsumer } from './adapters/outbound/bullmq/orders.consumer';
import { RedisIdempotencyAdapter } from './adapters/outbound/redis/idempotency.adapter';
import { OrdersController } from './adapters/inbound/orders.controller';
import {
  CREATE_ORDER_USE_CASE,
  IDEMPOTENCY_PORT,
  ORDERS_QUEUE,
  ORDERS_DLQ,
  ORDERS_QUEUE_PORT,
  ORDERS_REPOSITORY,
  ORDERS_STORAGE_PORT,
  ORDERS_OUTBOX_PORT,
} from './orders.tokens';
import { CreateOrderService } from './application/services/create-order.service';
import { UNIT_OF_WORK } from '../../common/constants';
import { MongooseUnitOfWorkAdapter } from '../../common/providers/mongoose-unit-of-work.adapter';
import { OrderOutboxDispatcherService } from './application/services/outbox-dispatcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderEntity.name, schema: OrderSchema },
      { name: OrderOutboxEntity.name, schema: OrderOutboxSchema },
    ]),
    BullModule.registerQueue({
      name: ORDERS_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    }),
    BullModule.registerQueue({
      name: ORDERS_DLQ,
    }),
  ],
  controllers: [OrdersController],
  providers: [
    {
      provide: CREATE_ORDER_USE_CASE,
      useClass: CreateOrderService,
    },
    {
      provide: ORDERS_REPOSITORY,
      useClass: OrdersRepositoryAdapter,
    },
    {
      provide: ORDERS_OUTBOX_PORT,
      useClass: OrdersOutboxRepositoryAdapter,
    },
    {
      provide: ORDERS_STORAGE_PORT,
      useClass: OrdersS3Adapter,
    },
    {
      provide: ORDERS_QUEUE_PORT,
      useClass: OrdersQueueAdapter,
    },
    {
      provide: IDEMPOTENCY_PORT,
      useClass: RedisIdempotencyAdapter,
    },
    {
      provide: UNIT_OF_WORK,
      useClass: MongooseUnitOfWorkAdapter,
    },
    OrdersQueueConsumer,
    OrderOutboxDispatcherService,
  ],
})
export class OrdersModule {}
