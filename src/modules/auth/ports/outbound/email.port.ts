export interface EmailPort {
  sendVerification(email: string, otp: string, token: string): Promise<void>;
}
