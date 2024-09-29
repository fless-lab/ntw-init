import { Response } from 'express';
import { ErrorResponseType, SuccessResponseType } from '../../types';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: SuccessResponseType<T>,
    statusCode = 200,
  ): Response {
    return res.status(statusCode).json(data);
  }

  static error(res: Response, error: ErrorResponseType): Response {
    const {
      error: { message, suggestions, statusCode },
    } = error;
    return res.status(statusCode).json({
      success: false,
      error: { status: statusCode, message, suggestions },
    });
  }
}
