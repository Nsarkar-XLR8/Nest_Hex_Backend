import { User } from '../../domain/models/user';

export interface UsersRepositoryPort {
  save(user: User, options?: { session?: unknown }): Promise<void>;
  update(user: User, options?: { session?: unknown }): Promise<void>;
  findByEmail(email: string, options?: { session?: unknown }): Promise<User | null>;
  findById(userId: string, options?: { session?: unknown }): Promise<User | null>;
}
