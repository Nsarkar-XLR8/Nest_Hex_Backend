import { DomainException } from '../../../../common/exceptions/domain.exception';

export class VerificationTokenInvalidException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/verification-token-invalid',
      title: 'Verification token invalid',
      status: 401,
      detail: 'Verification token is invalid or expired',
    });
  }
}
