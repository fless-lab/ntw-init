import { authenticate, clientAuthentication } from './middlewares';
import { AuthService } from './services';

export const AuthenticationModule = {
  services: {
    AuthService,
  },
  middlewares: {
    authenticate,
    enableClientAuth: clientAuthentication,
  },
};
