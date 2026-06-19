import { Order } from '../../../domain/models/order';
import { OrderItem } from '../../../domain/models/order-item';
import { OrderDocument } from './order.schema';

export class OrderMapper {
  static toDomain(document: OrderDocument): Order {
    return Order.rehydrate({
      id: document.id,
      customerId: document.customerId,
      items: document.items.map((item) =>
        OrderItem.create(item.sku, item.quantity, item.unitPrice),
      ),
      totalAmount: document.totalAmount,
      status: document.status as 'PENDING' | 'SUBMITTED',
      createdAt: document.createdAt,
    });
  }

  static toPersistence(order: Order): Partial<OrderDocument> {
    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
