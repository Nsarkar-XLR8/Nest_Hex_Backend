import { DomainException } from '../../../../common/exceptions/domain.exception';

export class ExternalServiceException extends DomainException {
  constructor(service: string, detail: string, meta?: Record<string, unknown>) {
    super({
      type: 'https://docs.nest-hex.local/problems/orders/external-service-failure',
      title: `${service} failure`,
      status: 503,
      detail,
      meta,
    });
  }
}
