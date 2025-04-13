import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del header
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN || 'access-secret', // Usa la misma clave que en JwtModule
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }; // Retorna información del token
  }
}