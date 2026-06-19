import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { OrdersOutboxPort, OrderOutboxRecord } from '../../../ports/outbound/orders-outbox.port';
import { OrderOutboxDocument, OrderOutboxEntity } from './outbox.schema';

@Injectable()
export class OrdersOutboxRepositoryAdapter implements OrdersOutboxPort {
  constructor(
    @InjectModel(OrderOutboxEntity.name)
    private readonly outboxModel: Model<OrderOutboxDocument>,
  ) {}

  async create(orderId: string, options?: { session?: unknown }): Promise<void> {
    const document = new this.outboxModel({
      id: randomUUID(),
      orderId,
      status: 'PENDING',
      attempts: 0,
    });

    await document.save({ session: options?.session as never });
  }

  async claimNext(): Promise<OrderOutboxRecord | null> {
    const document = await this.outboxModel
      .findOneAndUpdate(
        { status: 'PENDING' },
        { status: 'PROCESSING' },
        { sort: { createdAt: 1 }, new: true },
      )
      .exec();

    if (!document) {
      return null;
    }

    return {
      id: document.id,
      orderId: document.orderId,
      status: document.status as OrderOutboxRecord['status'],
      attempts: document.attempts,
      lastError: document.lastError,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  async markProcessed(id: string): Promise<void> {
    await this.outboxModel.updateOne(
      { id },
      { status: 'PROCESSED', lastError: undefined },
    ).exec();
  }

  async markFailed(id: string, error: string, attempts: number, status: 'PENDING' | 'FAILED'): Promise<void> {
    await this.outboxModel.updateOne(
      { id },
      { status, lastError: error, attempts },
    ).exec();
  }
}
