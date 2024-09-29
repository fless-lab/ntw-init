import { Request, Response, NextFunction } from 'express';
import { AuthenticationStrategies } from '../strategies';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  AuthenticationStrategies.jwt.verifyAccessToken(req, res, (authErr: any) => {
    if (authErr) {
      return next(authErr);
    }

    // @ts-ignore: Suppress TS error for non-existent property
    const payload = req.payload;

    if (payload && typeof payload.aud === 'string') {
      const userId = payload.aud;
      ASYNC_STORAGE.run(() => {
        ASYNC_STORAGE.set('currentUserId', userId);
        next();
      });
    } else {
      LOGGER.warn(
        'Warning: Unable to attach user context, missing payload or audience field.',
      );
      next();
    }
  });
};
