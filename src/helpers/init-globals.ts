import { ConfigService } from '../core/config';
import { AsyncStorageService } from '../modules/shared/localstorage';
import { LoggerService } from '../modules/shared/logger';

export class GlobalInitializer {
  public static init() {
    global.CONFIG = ConfigService.getInstance().getConfig();
    global.LOGGER = LoggerService.getInstance();
    global.ASYNC_STORAGE = AsyncStorageService.getInstance();

    LOGGER.info('Superglobals have been successfully initialized.');
  }
}
