import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPort } from '../../../ports/outbound/token.port';

@Injectable()
export class JwtTokenAdapter implements TokenPort {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(payload: { sub: string; email: string; roles: string[] }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
