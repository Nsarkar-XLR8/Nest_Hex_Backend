import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUseCase } from '../../ports/inbound/auth.usecase';
import { AUTH_SERVICE } from '../../auth.tokens';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { buildResponse, createLink } from '../../../common/hateoas/hateoas';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthUseCase,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<ReturnType<typeof buildResponse>> {
    const result = await this.authService.register(body);

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/auth/register', method: 'POST' }),
      createLink({ rel: 'verify-email', href: '/api/v1/auth/verify-email', method: 'POST' }),
    ]);
  }

  @Post('login')
  async login(@Body() body: LoginDto): Promise<ReturnType<typeof buildResponse>> {
    const result = await this.authService.login(body);

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/auth/login', method: 'POST' }),
      createLink({ rel: 'refresh', href: '/api/v1/auth/refresh', method: 'POST' }),
      createLink({ rel: 'logout', href: '/api/v1/auth/logout', method: 'POST' }),
    ]);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyOtpDto): Promise<ReturnType<typeof buildResponse>> {
    const result = await this.authService.verifyEmail(body);

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/auth/verify-email', method: 'POST' }),
      createLink({ rel: 'login', href: '/api/v1/auth/login', method: 'POST' }),
    ]);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto): Promise<ReturnType<typeof buildResponse>> {
    const result = await this.authService.refresh(body);

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/auth/refresh', method: 'POST' }),
      createLink({ rel: 'profile', href: '/api/v1/users/me', method: 'GET' }),
    ]);
  }

  @Post('logout')
  async logout(@Body() body: RefreshTokenDto): Promise<ReturnType<typeof buildResponse>> {
    const result = await this.authService.logout(body);

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/auth/logout', method: 'POST' }),
      createLink({ rel: 'login', href: '/api/v1/auth/login', method: 'POST' }),
    ]);
  }
}
