import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidOrderException extends DomainException {
  constructor(detail: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/orders/invalid-order',
      title: 'Invalid order',
      status: 400,
      detail,
    });
  }
}
