import { DomainException } from '../../../../common/exceptions/domain.exception';

export class OrderNotFoundException extends DomainException {
  constructor(orderId: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/orders/not-found',
      title: 'Order not found',
      status: 404,
      detail: `Order ${orderId} was not found`,
    });
  }
}
