import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/invalid-credentials',
      title: 'Invalid credentials',
      status: 401,
      detail: 'Email or password is incorrect',
    });
  }
}
