import { Response } from 'express';
import { ApiResponse } from '..';
import { ErrorResponse } from './response';

export const GlobalErrorHandler = (
  err: Error | ErrorResponse,
  res: Response,
): void => {
  const isErrorResponse = err instanceof ErrorResponse;
  const error = isErrorResponse
    ? err
    : new ErrorResponse(
        'GENERAL_ERROR',
        err.message || 'An unexpected error occurred',
      );

  ApiResponse.error(res, {
    success: false,
    error,
    ...(!CONFIG.runningProd && !isErrorResponse && { stack: err.stack }),
  });
};
