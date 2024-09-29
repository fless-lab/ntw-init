import rateLimit from 'express-rate-limit';

const msToMinutes = (ms: number): number => {
  return Math.ceil(ms / 60000);
};

export const apiRateLimiter = rateLimit({
  windowMs: CONFIG.rate.limit,
  max: CONFIG.rate.max,
  standardHeaders: !CONFIG.runningProd,
  message: `<DDOS Suspected> Too many requests from this IP, please try again after ${msToMinutes(CONFIG.rate.limit)} minutes.`,
  handler: (req, res) => {
    LOGGER.warn(`Too many requests from IP: ${req.ip}`);
    res.status(429).json({
      message: `<DDOS Suspected> Too many requests from this IP, please try again after ${msToMinutes(CONFIG.rate.limit)} minutes.`,
    });
  },
});
