import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../../domain/errors/custom.error';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
};
