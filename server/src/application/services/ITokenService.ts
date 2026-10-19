import { UserRole } from '../../domain/types';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface ITokenService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
