export interface TokenPort {
  signAccessToken(payload: { sub: string; email: string; roles: string[] }): Promise<string>;
}
