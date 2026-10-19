import { Request, Response, NextFunction } from 'express';
import { ITokenService, JwtPayload } from '../../application/services/ITokenService';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export function createAuthMiddleware(tokenService: ITokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Missing authentication token.'));
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = tokenService.verify(token);
      (req as AuthenticatedRequest).user = payload;
      next();
    } catch {
      next(new UnauthorizedError('Invalid or expired token.'));
    }
  };
}
