export interface EmailVerificationPort {
  storeVerification(userId: string, token: string, otpHash: string, ttlSeconds: number): Promise<void>;
  getVerification(token: string): Promise<{ userId: string; otpHash: string } | null>;
  clearVerification(token: string): Promise<void>;
}
