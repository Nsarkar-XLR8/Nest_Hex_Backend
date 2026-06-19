import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/invalid-refresh',
      title: 'Invalid refresh token',
      status: 401,
      detail: 'Refresh token is invalid or expired',
    });
  }
}
