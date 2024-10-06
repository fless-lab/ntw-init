import {
  apiRateLimiter,
  bruteForceMiddleware,
  validateRequest,
} from './middlewares';

export const SharedModule = {
  services: {},
  middlewares: {
    bruteForce: bruteForceMiddleware,
    enableRateLimiter: apiRateLimiter,
    validate: validateRequest,
  },
};
