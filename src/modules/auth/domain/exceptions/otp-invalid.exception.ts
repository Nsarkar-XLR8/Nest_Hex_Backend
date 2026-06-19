import { DomainException } from '../../../../common/exceptions/domain.exception';

export class OtpInvalidException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/otp-invalid',
      title: 'OTP invalid',
      status: 401,
      detail: 'OTP is invalid',
    });
  }
}
