import { Request, Response, NextFunction } from 'express';

export const clientAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientToken = req.headers['x-client-token'] as string;

  if (!clientToken) {
    LOGGER.warn(
      `Unauthorized access attempt from IP: ${req.ip} - No client token provided`,
    );
    return res.status(401).send('Unauthorized');
  }

  const [username, password] = Buffer.from(clientToken, 'base64')
    .toString()
    .split(':');

  const validUser = CONFIG.basicAuthUser;
  const validPass = CONFIG.basicAuthPass;

  if (username === validUser && password === validPass) {
    LOGGER.info(`Client authenticated successfully from IP: ${req.ip}`);
    return next();
  } else {
    LOGGER.warn(
      `Forbidden access attempt from IP: ${req.ip} - Invalid credentials`,
    );
    return res.status(403).send('Forbidden');
  }
};