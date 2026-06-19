import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepositoryPort } from '../../../ports/outbound/users-repository.port';
import { User } from '../../../domain/models/user';
import { UserDocument, UserEntity } from './user.schema';
import { UserMapper } from './user.mapper';

@Injectable()
export class UsersRepositoryAdapter implements UsersRepositoryPort {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User, options?: { session?: unknown }): Promise<void> {
    const persistence = UserMapper.toPersistence(user);
    const document = new this.userModel(persistence);
    await document.save({ session: options?.session as never });
  }

  async update(user: User, options?: { session?: unknown }): Promise<void> {
    const persistence = UserMapper.toPersistence(user);
    await this.userModel
      .updateOne({ id: user.id }, persistence, { session: options?.session as never })
      .exec();
  }

  async findByEmail(email: string, options?: { session?: unknown }): Promise<User | null> {
    const document = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .session(options?.session as never)
      .exec();

    return document ? UserMapper.toDomain(document) : null;
  }

  async findById(userId: string, options?: { session?: unknown }): Promise<User | null> {
    const document = await this.userModel
      .findOne({ id: userId })
      .session(options?.session as never)
      .exec();

    return document ? UserMapper.toDomain(document) : null;
  }
}
