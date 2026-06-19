export interface OtpPort {
  storeOtp(userId: string, otpHash: string, ttlSeconds: number): Promise<void>;
  getOtpHash(userId: string): Promise<string | null>;
  clearOtp(userId: string): Promise<void>;
}
