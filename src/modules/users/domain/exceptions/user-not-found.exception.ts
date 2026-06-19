import { DomainException } from '../../../../common/exceptions/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/users/not-found',
      title: 'User not found',
      status: 404,
      detail: `User ${identifier} was not found`,
    });
  }
}
