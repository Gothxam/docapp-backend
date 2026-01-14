import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = ((process.env.JWT_SECRET || 'secret123').toString().replace(/^"|"$/g, '')).replace(/;$/g, '');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
    try {
      console.log('JwtStrategy initialized, JWT secret length:', secret.length);
    } catch (e) {
      console.error('Error logging JwtStrategy init', e);
    }
  }

  async validate(payload: any) {
    try {
      console.log('JWT payload in strategy validate:', payload);
    } catch (e) {
      console.error('Error logging JWT payload', e);
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
