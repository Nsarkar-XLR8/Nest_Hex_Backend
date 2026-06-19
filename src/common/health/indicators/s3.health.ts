import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT } from '../../constants';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../config/env.schema';

@Injectable()
export class S3HealthIndicator extends HealthIndicator {
  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    private readonly config: ConfigService<Env, true>,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const bucket = this.config.get('S3_BUCKET', { infer: true });
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: bucket }));
      return this.getStatus(key, true);
    } catch (error) {
      const health = this.getStatus(key, false);
      throw new HealthCheckError('S3 health check failed', health);
    }
  }
}
