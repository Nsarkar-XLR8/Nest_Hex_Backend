import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { AuthUseCase, LoginCommand, RegisterCommand, VerifyOtpCommand } from '../../ports/inbound/auth.usecase';
import { UsersRepositoryPort } from '../../../users/ports/outbound/users-repository.port';
import { USERS_REPOSITORY } from '../../../users/users.tokens';
import { User } from '../../../users/domain/models/user';
import { UserAlreadyExistsException } from '../../../users/domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserInactiveException } from '../../../users/domain/exceptions/user-inactive.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { OtpInvalidException } from '../../domain/exceptions/otp-invalid.exception';
import { EmailPort } from '../../ports/outbound/email.port';
import { TokenPort } from '../../ports/outbound/token.port';
import { EmailVerificationPort } from '../../ports/outbound/email-verification.port';
import { RefreshTokenPort } from '../../ports/outbound/refresh-token.port';
import { AuthAttemptsPort } from '../../ports/outbound/auth-attempts.port';
import { PasswordBreachPort } from '../../ports/outbound/password-breach.port';
import { AUTH_ATTEMPTS_PORT, AUTH_SERVICE, EMAIL_PORT, EMAIL_VERIFICATION_PORT, PASSWORD_BREACH_PORT, REFRESH_TOKEN_PORT, TOKEN_PORT } from '../../auth.tokens';
import { Env } from '../../../../config/env.schema';
import { TooManyRequestsException } from '../../domain/exceptions/too-many-requests.exception';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';
import { VerificationTokenInvalidException } from '../../domain/exceptions/verification-token-invalid.exception';
import { AuditLogService } from '../../../../common/providers/audit-log.service';

@Injectable()
export class AuthService implements AuthUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    @Inject(TOKEN_PORT)
    private readonly tokenPort: TokenPort,
    @Inject(EMAIL_VERIFICATION_PORT)
    private readonly emailVerification: EmailVerificationPort,
    @Inject(REFRESH_TOKEN_PORT)
    private readonly refreshTokens: RefreshTokenPort,
    @Inject(AUTH_ATTEMPTS_PORT)
    private readonly attempts: AuthAttemptsPort,
    @Inject(PASSWORD_BREACH_PORT)
    private readonly passwordBreach: PasswordBreachPort,
    private readonly audit: AuditLogService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(command: RegisterCommand): Promise<{ userId: string; verificationToken: string }> {
    const existing = await this.usersRepository.findByEmail(command.email);
    if (existing) {
      throw new UserAlreadyExistsException(command.email);
    }

    await this.passwordBreach.assertSafe(command.password);
    const passwordHash = await argon2.hash(command.password);
    const user = User.create({
      id: randomUUID(),
      email: command.email,
      passwordHash,
      isActive: false,
    });

    await this.usersRepository.save(user);
    this.audit.log('auth.register', { userId: user.id, email: user.email });
    const otp = this.generateOtp();
    const otpHash = await argon2.hash(otp);
    const ttlSeconds = this.config.get('OTP_TTL_SECONDS', { infer: true });
    const token = randomUUID();

    await this.emailVerification.storeVerification(user.id, token, otpHash, ttlSeconds);
    try {
      await this.emailPort.sendVerification(user.email, otp, token);
    } catch (error) {
      await this.emailVerification.clearVerification(token);
      throw error;
    }

    return { userId: user.id, verificationToken: token };
  }

  async verifyEmail(command: VerifyOtpCommand): Promise<{ verified: boolean }> {
    const lockKey = `verify:${command.token}`;
    const locked = await this.attempts.isLocked(lockKey);
    if (locked) {
      throw new TooManyRequestsException('email verification');
    }

    const verification = await this.emailVerification.getVerification(command.token);
    if (!verification) {
      await this.attempts.registerFailure(lockKey, this.config.get('OTP_ATTEMPTS_LIMIT', { infer: true }), this.config.get('OTP_LOCK_TTL_SECONDS', { infer: true }));
      throw new VerificationTokenInvalidException();
    }

    const user = await this.usersRepository.findById(verification.userId);
    if (!user || user.email !== command.email.toLowerCase()) {
      throw new UserNotFoundException(command.email);
    }

    const isValid = await argon2.verify(verification.otpHash, command.otp);
    if (!isValid) {
      const result = await this.attempts.registerFailure(
        lockKey,
        this.config.get('OTP_ATTEMPTS_LIMIT', { infer: true }),
        this.config.get('OTP_LOCK_TTL_SECONDS', { infer: true }),
      );
      if (result.locked) {
        throw new TooManyRequestsException('email verification');
      }
      throw new OtpInvalidException();
    }

    await this.emailVerification.clearVerification(command.token);
    await this.attempts.clear(lockKey);

    const activated = user.activate();
    await this.usersRepository.update(activated);
    this.audit.log('auth.verify_email', { userId: user.id, email: user.email });

    return { verified: true };
  }

  async login(command: LoginCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const lockKey = `login:${command.email.toLowerCase()}`;
    const locked = await this.attempts.isLocked(lockKey);
    if (locked) {
      throw new TooManyRequestsException('login');
    }

    const user = await this.usersRepository.findByEmail(command.email);
    if (!user) {
      throw new UserNotFoundException(command.email);
    }

    if (!user.isActive) {
      throw new UserInactiveException(command.email);
    }

    const isValid = await argon2.verify(user.passwordHash, command.password);
    if (!isValid) {
      const result = await this.attempts.registerFailure(
        lockKey,
        this.config.get('LOGIN_ATTEMPTS_LIMIT', { infer: true }),
        this.config.get('LOGIN_LOCK_TTL_SECONDS', { infer: true }),
      );
      if (result.locked) {
        throw new TooManyRequestsException('login');
      }
      throw new InvalidCredentialsException();
    }

    await this.attempts.clear(lockKey);
    this.audit.log('auth.login', { userId: user.id, email: user.email });

    const accessToken = await this.tokenPort.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    const refresh = await this.refreshTokens.create(
      user.id,
      user.roles,
      this.config.get('REFRESH_TTL_SECONDS', { infer: true }),
    );

    return { accessToken, refreshToken: refresh.refreshToken };
  }

  async refresh(command: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const rotated = await this.refreshTokens.rotate(
      command.refreshToken,
      this.config.get('REFRESH_TTL_SECONDS', { infer: true }),
    );

    if (!rotated) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.usersRepository.findById(rotated.userId);
    if (!user) {
      throw new UserNotFoundException(rotated.userId);
    }

    const accessToken = await this.tokenPort.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: rotated.roles,
    });

    return { accessToken, refreshToken: rotated.refreshToken };
  }

  async logout(command: { refreshToken: string }): Promise<{ revoked: boolean }> {
    await this.refreshTokens.revoke(command.refreshToken);
    this.audit.log('auth.logout', { refreshToken: command.refreshToken });
    return { revoked: true };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const authUseCaseProvider = {
  provide: AUTH_SERVICE,
  useClass: AuthService,
};
