export const ORDERS_QUEUE = 'orders';
export const ORDERS_DLQ = 'orders.dlq';

export const CREATE_ORDER_USE_CASE = Symbol('CREATE_ORDER_USE_CASE');
export const ORDERS_REPOSITORY = Symbol('ORDERS_REPOSITORY');
export const ORDERS_QUEUE_PORT = Symbol('ORDERS_QUEUE_PORT');
export const ORDERS_STORAGE_PORT = Symbol('ORDERS_STORAGE_PORT');
export const IDEMPOTENCY_PORT = Symbol('IDEMPOTENCY_PORT');
export const ORDERS_OUTBOX_PORT = Symbol('ORDERS_OUTBOX_PORT');
