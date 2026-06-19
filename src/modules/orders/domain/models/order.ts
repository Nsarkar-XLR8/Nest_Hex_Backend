import { InvalidOrderException } from '../exceptions/invalid-order.exception';
import { OrderItem } from './order-item';

export type OrderStatus = 'PENDING' | 'SUBMITTED';

export class Order {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly status: OrderStatus,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    customerId: string;
    items: OrderItem[];
    createdAt?: Date;
  }): Order {
    if (!params.id) {
      throw new InvalidOrderException('Order ID is required');
    }

    if (!params.customerId) {
      throw new InvalidOrderException('Customer ID is required');
    }

    if (!params.items || params.items.length === 0) {
      throw new InvalidOrderException('Order must contain at least one item');
    }

    const totalAmount = params.items.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );

    if (totalAmount <= 0) {
      throw new InvalidOrderException('Order total must be greater than zero');
    }

    return new Order(
      params.id,
      params.customerId,
      params.items,
      totalAmount,
      'PENDING',
      params.createdAt ?? new Date(),
    );
  }

  static rehydrate(params: {
    id: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
  }): Order {
    return new Order(
      params.id,
      params.customerId,
      params.items,
      params.totalAmount,
      params.status,
      params.createdAt,
    );
  }

  submit(): Order {
    if (this.status !== 'PENDING') {
      throw new InvalidOrderException('Only pending orders can be submitted');
    }

    return new Order(
      this.id,
      this.customerId,
      this.items,
      this.totalAmount,
      'SUBMITTED',
      this.createdAt,
    );
  }
}
