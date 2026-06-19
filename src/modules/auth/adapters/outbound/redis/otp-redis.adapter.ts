import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { OtpPort } from '../../../ports/outbound/otp.port';
import { REDIS_CLIENT } from '../../../../common/constants';

@Injectable()
export class RedisOtpAdapter implements OtpPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async storeOtp(userId: string, otpHash: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(userId), otpHash, 'EX', ttlSeconds);
  }

  async getOtpHash(userId: string): Promise<string | null> {
    return this.redis.get(this.key(userId));
  }

  async clearOtp(userId: string): Promise<void> {
    await this.redis.del(this.key(userId));
  }

  private key(userId: string): string {
    return `otp:${userId}`;
  }
}
