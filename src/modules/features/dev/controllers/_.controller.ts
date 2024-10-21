/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
import { Request, Response, NextFunction } from 'express';
import { listRoutes } from 'helpers';

export class DevHelperController {
  static async getAppRoutes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const appRoutes = listRoutes();
      LOGGER.file('app_routes', appRoutes);
      res.json({ sucess: true, data: appRoutes });
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }
}
