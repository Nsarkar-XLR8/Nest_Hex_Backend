import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { RefreshTokenPort } from '../../../ports/outbound/refresh-token.port';
import { REDIS_CLIENT } from '../../../../common/constants';

@Injectable()
export class RedisRefreshTokenAdapter implements RefreshTokenPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async create(userId: string, roles: string[], ttlSeconds: number): Promise<{ refreshToken: string }> {
    const sessionId = randomUUID();
    const secret = randomUUID();
    const tokenHash = await argon2.hash(secret);

    await this.redis.set(
      this.key(sessionId),
      JSON.stringify({ userId, roles, tokenHash }),
      'EX',
      ttlSeconds,
    );

    return { refreshToken: `${sessionId}.${secret}` };
  }

  async rotate(refreshToken: string, ttlSeconds: number): Promise<{ userId: string; roles: string[]; refreshToken: string } | null> {
    const [sessionId, secret] = refreshToken.split('.');
    if (!sessionId || !secret) {
      return null;
    }

    const payload = await this.redis.get(this.key(sessionId));
    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(payload) as { userId: string; roles: string[]; tokenHash: string };
    const isValid = await argon2.verify(parsed.tokenHash, secret);
    if (!isValid) {
      return null;
    }

    const nextSecret = randomUUID();
    const tokenHash = await argon2.hash(nextSecret);

    await this.redis.set(
      this.key(sessionId),
      JSON.stringify({ userId: parsed.userId, roles: parsed.roles, tokenHash }),
      'EX',
      ttlSeconds,
    );

    return {
      userId: parsed.userId,
      roles: parsed.roles,
      refreshToken: `${sessionId}.${nextSecret}`,
    };
  }

  async revoke(refreshToken: string): Promise<void> {
    const [sessionId] = refreshToken.split('.');
    if (sessionId) {
      await this.redis.del(this.key(sessionId));
    }
  }

  private key(sessionId: string): string {
    return `refresh:${sessionId}`;
  }
}
