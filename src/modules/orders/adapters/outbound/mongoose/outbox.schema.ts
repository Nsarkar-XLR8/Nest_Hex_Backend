import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderOutboxDocument = OrderOutboxEntity & Document;

@Schema({ collection: 'orders_outbox', timestamps: true, versionKey: 'version' })
export class OrderOutboxEntity {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  orderId!: string;

  @Prop({ required: true, index: true })
  status!: string;

  @Prop({ required: true, default: 0 })
  attempts!: number;

  @Prop()
  lastError?: string;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const OrderOutboxSchema = SchemaFactory.createForClass(OrderOutboxEntity);
OrderOutboxSchema.index({ status: 1, createdAt: 1 });
