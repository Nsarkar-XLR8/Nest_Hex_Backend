import { Injectable } from '@nestjs/common';
import { PasswordBreachPort } from '../../../ports/outbound/password-breach.port';
import { PasswordBreachedException } from '../../domain/exceptions/password-breached.exception';

@Injectable()
export class LocalPasswordBreachAdapter implements PasswordBreachPort {
  private readonly denylist = new Set([
    'password',
    '12345678',
    'qwerty123',
    'letmein123',
    'admin1234',
  ]);

  async assertSafe(password: string): Promise<void> {
    if (this.denylist.has(password.toLowerCase())) {
      throw new PasswordBreachedException();
    }
  }
}
