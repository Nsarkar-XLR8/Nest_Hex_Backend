import { DomainException } from '../../../../common/exceptions/domain.exception';

export class TooManyRequestsException extends DomainException {
  constructor(action: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/too-many-requests',
      title: 'Too many requests',
      status: 429,
      detail: `Too many attempts for ${action}. Please try again later.`,
    });
  }
}
