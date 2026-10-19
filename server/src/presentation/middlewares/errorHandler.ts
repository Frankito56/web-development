import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainErrors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' ? { details: err.message } : {}),
  });
}
