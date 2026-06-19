import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidUserException extends DomainException {
  constructor(detail: string) {
    super({
      type: 'https://docs.nest-hex.local/problems/users/invalid-user',
      title: 'Invalid user',
      status: 400,
      detail,
    });
  }
}
