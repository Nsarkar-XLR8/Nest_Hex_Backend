import { InvalidUserException } from '../exceptions/invalid-user.exception';

export type UserRole = 'USER' | 'ADMIN';

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly roles: UserRole[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: string;
    passwordHash: string;
    roles?: UserRole[];
    isActive?: boolean;
    createdAt?: Date;
  }): User {
    if (!params.id) {
      throw new InvalidUserException('User ID is required');
    }

    if (!params.email || !params.email.includes('@')) {
      throw new InvalidUserException('Valid email is required');
    }

    if (!params.passwordHash) {
      throw new InvalidUserException('Password hash is required');
    }

    return new User(
      params.id,
      params.email.toLowerCase(),
      params.passwordHash,
      params.roles ?? ['USER'],
      params.isActive ?? true,
      params.createdAt ?? new Date(),
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.roles,
      true,
      this.createdAt,
    );
  }

  static rehydrate(params: {
    id: string;
    email: string;
    passwordHash: string;
    roles: UserRole[];
    isActive: boolean;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.email.toLowerCase(),
      params.passwordHash,
      params.roles,
      params.isActive,
      params.createdAt,
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.roles,
      false,
      this.createdAt,
    );
  }
}
