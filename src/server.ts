/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./types/global.d.ts" />

// Import global variables first
import { GlobalInitializer } from './helpers/init-globals';

// Initialize global variables
GlobalInitializer.init();

// Import other modules
import { initServices } from './helpers';
import { WebServer } from './core/framework';

process.on('uncaughtException', function (err) {
  LOGGER.error('Uncaught Exception:', err);
  LOGGER.file('UNCAUGHT_EXCEPTION', err);
});

async function startServer() {
  try {
    await initServices();
    global.APP = WebServer.app;
    APP.listen(CONFIG.port, () => {
      LOGGER.info(`Server running on port ${CONFIG.port}`);
    });
  } catch (error) {
    LOGGER.error('Failed to initialize services', error as any);
  }
}

startServer();
