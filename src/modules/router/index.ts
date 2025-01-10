import { AuthRoutes, TodoRoutes } from 'apps';
import { Router } from 'express';
import { DevRoutes } from 'modules/features';

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
    RouterModule.router.use('', DevRoutes);
    RouterModule.router.use('/todos', TodoRoutes);
    RouterModule.router.use('/auth', AuthRoutes);
  }
}
