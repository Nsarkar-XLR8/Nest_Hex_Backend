import { Inject, Logger, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { OrdersStoragePort } from '../../../ports/outbound/orders-storage.port';
import { Order } from '../../../domain/models/order';
import { ExternalServiceException } from '../../../application/exceptions/external-service.exception';
import { S3_CLIENT } from '../../../../common/constants';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../../config/env.schema';

@Injectable()
export class OrdersS3Adapter implements OrdersStoragePort {
  private readonly logger = new Logger(OrdersS3Adapter.name);

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async uploadOrderSnapshot(order: Order): Promise<{ key: string }> {
    const bucket = this.config.get('S3_BUCKET', { infer: true });
    const key = `orders/${order.id}.json`;
    const payload = JSON.stringify({
      id: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    });

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json',
        }),
      );

      return { key };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload order snapshot: ${message}`);
      throw new ExternalServiceException('S3', 'Failed to upload order snapshot', {
        message,
      });
    }
  }
}
