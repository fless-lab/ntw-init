import { Application } from 'express';

const initializeViewEngine = async (app: Application): Promise<void> => {
  const viewEngine = CONFIG.defaultViewEngine;

  if (!CONFIG.viewEngines.includes(viewEngine)) {
    throw new Error(
      `View engine ${viewEngine} is not supported. Please choose one of the following: ${CONFIG.viewEngines.join(', ')}.`,
    );
  }

  try {
    const viewEngineModule = await import(`./${viewEngine}`);
    viewEngineModule.default(app);
    LOGGER.info(`${viewEngine} view engine initialized.`);
  } catch (error) {
    LOGGER.error(
      `Failed to initialize ${viewEngine} view engine.`,
      error as Error,
    );
    throw new Error(`View engine ${viewEngine} not supported.`);
  }
};

export default initializeViewEngine;
