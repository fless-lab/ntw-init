import { Application } from 'express';
import session from 'express-session';
import flash from 'connect-flash';

export const initializeSessionAndFlash = (app: Application): void => {
  app.use(
    session({
      secret: CONFIG.session.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: CONFIG.runningProd },
    }),
  );
  app.use(flash());
};
