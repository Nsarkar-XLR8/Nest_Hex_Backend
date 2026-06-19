import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserEntity & Document;

@Schema({ collection: 'users', timestamps: true, versionKey: 'version' })
export class UserEntity {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [String], default: ['USER'] })
  roles!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ required: true })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
