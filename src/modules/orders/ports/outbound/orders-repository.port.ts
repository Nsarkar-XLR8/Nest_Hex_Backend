import { Order } from '../../domain/models/order';

export interface OrdersRepositoryPort {
  save(order: Order, options?: { session?: unknown }): Promise<void>;
  findById(orderId: string, options?: { session?: unknown }): Promise<Order | null>;
}
