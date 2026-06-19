import { DomainException } from '../../../../common/exceptions/domain.exception';

export class OtpExpiredException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/auth/otp-expired',
      title: 'OTP expired',
      status: 401,
      detail: 'OTP is expired or missing',
    });
  }
}
