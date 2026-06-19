import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../constants';
import { Inject } from '@nestjs/common';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      const isHealthy = result === 'PONG';
      const health = this.getStatus(key, isHealthy);
      if (isHealthy) {
        return health;
      }
      throw new HealthCheckError('Redis ping failed', health);
    } catch (error) {
      const health = this.getStatus(key, false);
      throw new HealthCheckError('Redis ping failed', health);
    }
  }
}
