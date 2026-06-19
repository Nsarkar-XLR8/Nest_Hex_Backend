import { Order } from '../../domain/models/order';

export interface OrdersStoragePort {
  uploadOrderSnapshot(order: Order): Promise<{ key: string }>;
}
