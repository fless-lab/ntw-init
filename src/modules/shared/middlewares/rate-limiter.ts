import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const msToMinutes = (ms: number): number => {
  return Math.ceil(ms / 60000);
};

export const apiRateLimiter = rateLimit({
  windowMs: CONFIG.rate.limit,
  max: CONFIG.rate.max,
  standardHeaders: !CONFIG.runningProd,
  skip: (req: Request) => {
    // Check those exluded patchs
    return CONFIG.rate.excludePaths.some((path) => req.path.startsWith(path));
  },
  message: `<DDOS Suspected> Too many requests from this IP, please try again after ${msToMinutes(CONFIG.rate.limit)} minutes.`,
  handler: (req: Request, res: Response) => {
    LOGGER.warn(`Too many requests from IP: ${req.ip}`);
    res.status(429).json({
      message: `<DDOS Suspected> Too many requests from this IP, please try again after ${msToMinutes(CONFIG.rate.limit)} minutes.`,
    });
  },
});
