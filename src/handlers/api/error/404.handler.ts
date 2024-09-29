import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from './response';

export const NotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new ErrorResponse('NOT_FOUND_ERROR', 'Resource Not Found'));
};
