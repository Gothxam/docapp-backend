import { Injectable } from '@nestjs/common';
const jwt = require('jsonwebtoken');

@Injectable()
export class JwtTokenService {
  generateToken(payload: any) {
    const secret = ((process.env.JWT_SECRET || 'secret123').toString().replace(/^"|"$/g, '')).replace(/;$/g, '');
    try {
      return jwt.sign(payload, secret, { expiresIn: '1d' });
    } catch (e) {
      console.error('Error signing JWT in JwtTokenService', e);
      throw e;
    }
  }
}
