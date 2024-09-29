import { Router } from 'express';
// import { AppRoutes } from '../../apps/app.routes';
// import { AuthRoutes } from '../../apps/auth.routes';
// import { OTPRoutes } from '../../apps/otp.routes';
// import { UserRoutes } from '../../apps/user.routes';

export class RouterModule {
  private static router: Router;

  public static getRouter(): Router {
    if (!RouterModule.router) {
      RouterModule.router = Router();
      RouterModule.initializeRoutes();
    }
    return RouterModule.router;
  }

  private static initializeRoutes(): void {
    // RouterModule.router.use('/', AppRoutes);
    // RouterModule.router.use('/users', UserRoutes);
    // RouterModule.router.use('/otp', OTPRoutes);
    // RouterModule.router.use('/auth', AuthRoutes);
  }
}
