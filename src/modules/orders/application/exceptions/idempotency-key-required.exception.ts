import { DomainException } from '../../../../common/exceptions/domain.exception';

export class IdempotencyKeyRequiredException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/orders/idempotency-required',
      title: 'Idempotency key required',
      status: 400,
      detail: 'Idempotency-Key header must be provided for order creation',
    });
  }
}
