import { DomainException } from '../../../../common/exceptions/domain.exception';

export class AuthExternalServiceException extends DomainException {
  constructor(service: string, detail: string, meta?: Record<string, unknown>) {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/external-service-failure',
      title: `${service} failure`,
      status: 503,
      detail,
      meta,
    });
  }
}
