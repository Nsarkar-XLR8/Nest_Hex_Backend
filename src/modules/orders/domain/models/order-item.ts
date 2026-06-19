import { InvalidOrderException } from '../exceptions/invalid-order.exception';

export class OrderItem {
  private constructor(
    public readonly sku: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}

  static create(sku: string, quantity: number, unitPrice: number): OrderItem {
    if (!sku || sku.trim().length === 0) {
      throw new InvalidOrderException('Order item SKU is required');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidOrderException('Order item quantity must be a positive integer');
    }

    if (unitPrice < 0) {
      throw new InvalidOrderException('Order item price cannot be negative');
    }

    return new OrderItem(sku, quantity, unitPrice);
  }

  get lineTotal(): number {
    return this.quantity * this.unitPrice;
  }
}
