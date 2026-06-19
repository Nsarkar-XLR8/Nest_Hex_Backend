import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../constants';
import { stopTracing } from '../telemetry/tracing';

@Injectable()
export class GracefulShutdownService implements OnApplicationShutdown {
  private readonly logger = new Logger(GracefulShutdownService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log(`Shutdown signal received: ${signal ?? 'unknown'}`);

    try {
      await this.redis.quit();
    } catch (error) {
      this.logger.warn('Failed to close Redis gracefully');
    }

    try {
      await this.connection.close();
    } catch (error) {
      this.logger.warn('Failed to close Mongo connection gracefully');
    }

    await stopTracing();
  }
}
