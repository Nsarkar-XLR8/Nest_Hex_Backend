import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { AuthAttemptsPort } from '../../../ports/outbound/auth-attempts.port';
import { REDIS_CLIENT } from '../../../../common/constants';

@Injectable()
export class RedisAuthAttemptsAdapter implements AuthAttemptsPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async registerFailure(key: string, limit: number, ttlSeconds: number): Promise<{ locked: boolean; attempts: number }> {
    const lockKey = this.lockKey(key);
    const locked = await this.redis.get(lockKey);
    if (locked) {
      return { locked: true, attempts: limit };
    }

    const attempts = await this.redis.incr(this.attemptKey(key));
    if (attempts === 1) {
      await this.redis.expire(this.attemptKey(key), ttlSeconds);
    }

    if (attempts >= limit) {
      await this.redis.set(lockKey, '1', 'EX', ttlSeconds);
      return { locked: true, attempts };
    }

    return { locked: false, attempts };
  }

  async clear(key: string): Promise<void> {
    await this.redis.del(this.attemptKey(key));
    await this.redis.del(this.lockKey(key));
  }

  async isLocked(key: string): Promise<boolean> {
    const locked = await this.redis.get(this.lockKey(key));
    return Boolean(locked);
  }

  private attemptKey(key: string): string {
    return `auth:attempts:${key}`;
  }

  private lockKey(key: string): string {
    return `auth:lock:${key}`;
  }
}
