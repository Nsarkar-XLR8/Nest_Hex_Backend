import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = OrderEntity & Document;

@Schema({ collection: 'orders', timestamps: true, versionKey: 'version' })
export class OrderEntity {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true })
  customerId!: string;

  @Prop({
    required: true,
    type: [
      {
        sku: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
      },
    ],
  })
  items!: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  createdAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderEntity);
