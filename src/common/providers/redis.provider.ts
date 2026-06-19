import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Env } from '../../config/env.schema';
import { REDIS_CLIENT } from '../constants';

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService<Env, true>) => {
    return new Redis({
      host: config.get('REDIS_HOST', { infer: true }),
      port: config.get('REDIS_PORT', { infer: true }),
      password: config.get('REDIS_PASSWORD', { infer: true }) || undefined,
      db: config.get('REDIS_DB', { infer: true }),
      maxRetriesPerRequest: 3,
    });
  },
  inject: [ConfigService],
};
