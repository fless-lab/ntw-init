import { RateLimiterMongo } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

let bruteForceLimiter: RateLimiterMongo | undefined;

const setupBFRateLimiter = async (): Promise<void> => {
  try {
    bruteForceLimiter = new RateLimiterMongo({
      storeClient: global.MONGO_CLIENT,
      points: CONFIG.bruteForce.freeRetries,
      duration: Math.ceil(CONFIG.bruteForce.lifetime / 1000),
      blockDuration: Math.ceil(CONFIG.bruteForce.maxWait / 1000),
    });

    LOGGER.info('Bruteforce rate limiter configured.');
  } catch (error) {
    LOGGER.error('Error setting up rate limiter', error as any);
  }
};

const bruteForceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!bruteForceLimiter) {
    await setupBFRateLimiter();
  }

  if (!bruteForceLimiter) {
    const error = new Error('Rate limiter could not be configured.');
    LOGGER.error(error.message, error);
    res.status(500).json({
      message: 'Rate limiter could not be configured. Please try again later.',
    });
    return;
  }

  try {
    await bruteForceLimiter.consume(req.ip as string);
    next();
  } catch (rejRes: any) {
    const retrySecs = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
    if (!CONFIG.runningProd) {
      res.set('Retry-After', String(retrySecs));
    }
    LOGGER.warn(
      `<Bruteforce Suspected> Too many attempts from IP: ${req.ip}. Retry after ${retrySecs} seconds.`,
    );
    res.status(429).json({
      message: `<Bruteforce Suspected> Too many attempts, please try again after ${Math.ceil(rejRes.msBeforeNext / 60000)} minutes.`,
    });
  }
};

export default bruteForceMiddleware;
