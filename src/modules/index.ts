import { AuthzModule } from './authz';
import { RouterModule } from './router';
import { SharedModule } from './shared';

export class AppModule {
  public static router: RouterModule;

  public static getRouter() {
    return RouterModule.getRouter();
  }

  public static fromAuthzModule() {
    return AuthzModule;
  }

  public static fromSharedModule() {
    return SharedModule;
  }
}
