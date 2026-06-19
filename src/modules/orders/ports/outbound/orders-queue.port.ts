export interface OrderCreatedJob {
  orderId: string;
  customerId: string;
  totalAmount: number;
}

export interface OrdersQueuePort {
  enqueueOrderCreated(payload: OrderCreatedJob): Promise<void>;
}
