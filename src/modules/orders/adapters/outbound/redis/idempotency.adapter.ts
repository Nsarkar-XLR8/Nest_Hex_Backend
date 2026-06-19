import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { IdempotencyPort } from '../../../ports/outbound/idempotency.port';
import { REDIS_CLIENT } from '../../../../common/constants';

@Injectable()
export class RedisIdempotencyAdapter implements IdempotencyPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'NX', 'EX', ttlSeconds);
    return result === 'OK';
  }

  async release(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
