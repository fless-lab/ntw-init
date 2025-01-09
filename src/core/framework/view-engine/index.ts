import { Application } from 'express';

export const initializeViewEngine = async (
  app: Application = APP,
): Promise<void> => {
  const viewEngine = CONFIG.views.defaultEngine;

  if (!CONFIG.views.engines.includes(viewEngine)) {
    throw new Error(
      `View engine ${viewEngine} is not supported. Please choose one of the following: ${CONFIG.views.engines.join(', ')}.`,
    );
  }

  try {
    const viewEngineModule = await import(`./${viewEngine}`);
    viewEngineModule.default(app);
    LOGGER.info(`**${viewEngine}** view engine initialized.`);
  } catch (error) {
    LOGGER.error(
      `Failed to initialize ${viewEngine} view engine.`,
      error as Error,
    );
    throw new Error(`View engine ${viewEngine} not supported.`);
  }
};
