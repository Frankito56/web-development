import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { UserRole } from '../../domain/types';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/DomainErrors';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access requires one of the following roles: ${allowedRoles.join(', ')}.`
        )
      );
    }

    next();
  };
}
