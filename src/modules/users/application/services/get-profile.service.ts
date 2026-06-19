import { Inject, Injectable } from '@nestjs/common';
import { GetProfileResult, GetProfileUseCase } from '../../ports/inbound/get-profile.usecase';
import { UsersRepositoryPort } from '../../ports/outbound/users-repository.port';
import { USERS_REPOSITORY } from '../../users.tokens';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class GetProfileService implements GetProfileUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
  ) {}

  async execute(userId: string): Promise<GetProfileResult> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
