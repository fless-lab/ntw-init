/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from 'modules';
import {
  initializeSessionAndFlash,
  initializeViewEngine,
} from 'core/framework';
import { helmetCSPConfig } from 'core/constants';
import { GlobalErrorHandler, NotFoundHandler } from '@nodesandbox/response-kit';

const app = express();
const AllRoutes = AppModule.getRouter();

// App middlewares
const AuthMiddlewares = AppModule.fromAuthzModule().authentication.middlewares;
const SharedMiddlewares = AppModule.fromSharedModule().middlewares;

const morganEnv = CONFIG.runningProd ? 'combined' : 'dev';

// Express middlewares
app.use(cors());
app.use(helmet());
app.use(helmetCSPConfig);
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(morgan(morganEnv));
app.use(express.json());
app.disable('x-powered-by');

// Initialize Session and Flash
initializeSessionAndFlash(app);

// Set view engine
initializeViewEngine(app);

// Client authentication middleware
app.use(AuthMiddlewares.enableClientAuth);

// Client authentication middleware
app.use(SharedMiddlewares.enableRateLimiter);

// API Routes
app.use('/api/v1', AllRoutes);

// Error handlers
app.use(NotFoundHandler);
app.use(GlobalErrorHandler);

export default app;
