import { DomainException } from '../../../../common/exceptions/domain.exception';

export class UserInactiveException extends DomainException {
  constructor(email: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/users/inactive',
      title: 'User inactive',
      status: 403,
      detail: `User ${email} is inactive`,
    });
  }
}
