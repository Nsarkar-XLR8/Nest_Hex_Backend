import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase } from '../../ports/inbound/get-profile.usecase';
import { USERS_SERVICE } from '../../users.tokens';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { buildResponse, createLink } from '../../../common/hateoas/hateoas';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE)
    private readonly getProfile: GetProfileUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { sub: string }): Promise<ReturnType<typeof buildResponse>> {
    const profile = await this.getProfile.execute(user.sub);

    return buildResponse(profile, [
      createLink({ rel: 'self', href: '/api/v1/users/me', method: 'GET' }),
      createLink({ rel: 'orders', href: '/api/v1/orders', method: 'GET' }),
    ]);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/ping')
  async adminPing(): Promise<ReturnType<typeof buildResponse>> {
    return buildResponse(
      { ok: true },
      [createLink({ rel: 'self', href: '/api/v1/users/admin/ping', method: 'GET' })],
      { role: 'ADMIN' },
    );
  }
}
