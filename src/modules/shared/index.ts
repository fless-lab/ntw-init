import {
  apiRateLimiter,
  bruteForceMiddleware,
  validateRequest,
} from './middlewares';
import { storage } from './storage';

export const SharedModule = {
  services: {
    storage,
  },
  middlewares: {
    bruteForce: bruteForceMiddleware,
    enableRateLimiter: apiRateLimiter,
    validate: validateRequest,
  },
};
