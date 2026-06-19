import { DomainException } from '../../../../common/exceptions/domain.exception';

export class PasswordBreachedException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/password-breached',
      title: 'Password rejected',
      status: 400,
      detail: 'Password is too common or compromised',
    });
  }
}
