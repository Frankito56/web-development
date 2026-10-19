import jwt from 'jsonwebtoken';
import { ITokenService, JwtPayload } from '../../application/services/ITokenService';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';

export class JwtService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'unilib-fallback-secret-development-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token.');
    }
  }
}
