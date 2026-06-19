export interface AuthAttemptsPort {
  registerFailure(key: string, limit: number, ttlSeconds: number): Promise<{ locked: boolean; attempts: number }>;
  clear(key: string): Promise<void>;
  isLocked(key: string): Promise<boolean>;
}
