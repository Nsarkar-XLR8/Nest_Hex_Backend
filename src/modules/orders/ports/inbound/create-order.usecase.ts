export interface CreateOrderCommand {
  customerId: string;
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  idempotencyKey: string;
}

export interface CreateOrderResult {
  orderId: string;
}

export interface CreateOrderUseCase {
  execute(command: CreateOrderCommand): Promise<CreateOrderResult>;
}
