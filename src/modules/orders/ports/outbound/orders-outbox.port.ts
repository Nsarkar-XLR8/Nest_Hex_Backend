export type OutboxStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface OrderOutboxRecord {
  id: string;
  orderId: string;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdersOutboxPort {
  create(orderId: string, options?: { session?: unknown }): Promise<void>;
  claimNext(): Promise<OrderOutboxRecord | null>;
  markProcessed(id: string): Promise<void>;
  markFailed(id: string, error: string, attempts: number, status: OutboxStatus): Promise<void>;
}
