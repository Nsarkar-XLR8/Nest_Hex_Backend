import { DomainException } from '../../../../common/exceptions/domain.exception';

export class IdempotencyKeyConflictException extends DomainException {
  constructor(key: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/orders/idempotency-conflict',
      title: 'Idempotency key conflict',
      status: 409,
      detail: `Idempotency key ${key} is already in use`,
    });
  }
}
