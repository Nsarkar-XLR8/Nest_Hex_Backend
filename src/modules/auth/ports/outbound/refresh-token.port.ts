export interface RefreshTokenRecord {
  userId: string;
  tokenHash: string;
  roles: string[];
}

export interface RefreshTokenPort {
  create(userId: string, roles: string[], ttlSeconds: number): Promise<{ refreshToken: string }>;
  rotate(refreshToken: string, ttlSeconds: number): Promise<{ userId: string; roles: string[]; refreshToken: string } | null>;
  revoke(refreshToken: string): Promise<void>;
}
