import { DomainException } from '../../../../common/exceptions/domain.exception';

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/users/already-exists',
      title: 'User already exists',
      status: 409,
      detail: `User with email ${email} already exists`,
    });
  }
}
