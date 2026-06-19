import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { EmailVerificationPort } from '../../../ports/outbound/email-verification.port';
import { REDIS_CLIENT } from '../../../../common/constants';

@Injectable()
export class RedisEmailVerificationAdapter implements EmailVerificationPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async storeVerification(userId: string, token: string, otpHash: string, ttlSeconds: number): Promise<void> {
    const payload = JSON.stringify({ userId, otpHash });
    await this.redis.set(this.key(token), payload, 'EX', ttlSeconds);
  }

  async getVerification(token: string): Promise<{ userId: string; otpHash: string } | null> {
    const payload = await this.redis.get(this.key(token));
    if (!payload) {
      return null;
    }

    return JSON.parse(payload) as { userId: string; otpHash: string };
  }

  async clearVerification(token: string): Promise<void> {
    await this.redis.del(this.key(token));
  }

  private key(token: string): string {
    return `verify:${token}`;
  }
}
