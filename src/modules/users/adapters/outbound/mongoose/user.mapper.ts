import { User } from '../../../domain/models/user';
import { UserDocument } from './user.schema';

export class UserMapper {
  static toDomain(document: UserDocument): User {
    return User.rehydrate({
      id: document.id,
      email: document.email,
      passwordHash: document.passwordHash,
      roles: document.roles as ('USER' | 'ADMIN')[],
      isActive: document.isActive,
      createdAt: document.createdAt,
    });
  }

  static toPersistence(user: User): Partial<UserDocument> {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
