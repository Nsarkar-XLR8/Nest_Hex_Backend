export interface RegisterCommand {
  email: string;
  password: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface VerifyOtpCommand {
  email: string;
  otp: string;
  token: string;
}

export interface AuthUseCase {
  register(command: RegisterCommand): Promise<{ userId: string; verificationToken: string }>;
  verifyEmail(command: VerifyOtpCommand): Promise<{ verified: boolean }>;
  login(command: LoginCommand): Promise<{ accessToken: string; refreshToken: string }>;
  refresh(command: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }>;
  logout(command: { refreshToken: string }): Promise<{ revoked: boolean }>;
}
