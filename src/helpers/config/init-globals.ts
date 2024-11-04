import { ConfigService } from 'core/config';
import { LoggerService } from '@nodesandbox/logger';
import { AsyncStorageService } from '@nodesandbox/async-storage';

export class GlobalInitializer {
  public static init() {
    global.CONFIG = ConfigService.getInstance().getConfig();
    global.LOGGER = LoggerService.getInstance();
    global.ASYNC_STORAGE = AsyncStorageService.getInstance();

    LOGGER.info('Superglobals have been successfully initialized.');
  }
}
