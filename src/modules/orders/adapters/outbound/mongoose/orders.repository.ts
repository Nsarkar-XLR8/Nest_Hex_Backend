import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrdersRepositoryPort } from '../../../ports/outbound/orders-repository.port';
import { Order } from '../../../domain/models/order';
import { OrderDocument, OrderEntity } from './order.schema';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrdersRepositoryAdapter implements OrdersRepositoryPort {
  constructor(
    @InjectModel(OrderEntity.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async save(order: Order, options?: { session?: unknown }): Promise<void> {
    const persistence = OrderMapper.toPersistence(order);
    const document = new this.orderModel(persistence);
    await document.save({ session: options?.session as never });
  }

  async findById(orderId: string, options?: { session?: unknown }): Promise<Order | null> {
    const document = await this.orderModel
      .findOne({ id: orderId })
      .session(options?.session as never)
      .exec();

    if (!document) {
      return null;
    }

    return OrderMapper.toDomain(document);
  }
}
