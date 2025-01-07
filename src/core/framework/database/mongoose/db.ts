import { Config } from 'core/config';
import mongoose, { Connection } from 'mongoose';
interface ConnectionCredentials {
  username?: string;
  password?: string;
}

interface MongoDBConfig
  extends Pick<Config['db'], 'host' | 'port' | 'name' | 'clientPort'> {
  test?: {
    host: string;
    port: number;
    name: string;
  };
  credentials?: ConnectionCredentials;
  directUrl?: string;
  options?: mongoose.ConnectOptions;
}

function buildConnectionUri(config: MongoDBConfig): string {
  if (config.directUrl) {
    return config.directUrl;
  }

  const credentials = config.credentials;
  const auth =
    credentials?.username && credentials?.password
      ? `${encodeURIComponent(credentials.username)}:${encodeURIComponent(credentials.password)}@`
      : '';

  return `mongodb://${auth}${config.host}:${config.port}`;
}

async function connect(
  dbConfig: MongoDBConfig,
  options?: mongoose.ConnectOptions,
): Promise<void> {
  try {
    const uri = buildConnectionUri(dbConfig);
    const mongooseOptions: mongoose.ConnectOptions = {
      ...CONFIG.db?.options,
      ...options,
      monitorCommands: true,
      dbName: dbConfig.name,
    };

    const logUri = uri.replace(/\/\/(.*?@)?/, '//***@');
    LOGGER.info(`Connecting to MongoDB: ${logUri}`);

    await mongoose.connect(uri, mongooseOptions);
    global.MONGO_CLIENT = mongoose.connection;

    global.MONGO_CLIENT.on('disconnected', () => {
      LOGGER.warn('MongoDB disconnected');
    });

    global.MONGO_CLIENT.on('reconnected', () => {
      LOGGER.info('MongoDB reconnected');
    });

    global.MONGO_CLIENT.on('error', (error: mongoose.Error) => {
      LOGGER.error('MongoDB connection error:', error);
    });
  } catch (error) {
    LOGGER.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function init(configOverride?: Partial<MongoDBConfig>): Promise<void> {
  try {
    if (global.MONGO_CLIENT?.readyState === 1) {
      LOGGER.info('MongoDB client already initialized and connected');
      return;
    }

    const dbConfig: MongoDBConfig = {
      host: CONFIG.db.host,
      port: CONFIG.db.port,
      name: CONFIG.db.name,
      clientPort: CONFIG.db.clientPort,
      test: {
        host: process.env.TEST_DB_HOST || CONFIG.db.host,
        port: parseInt(process.env.TEST_DB_PORT || String(CONFIG.db.port)),
        name: process.env.TEST_DB_NAME || 'test-db',
      },
      ...configOverride,
    };

    await connect(dbConfig);
    LOGGER.info('MongoDB connected successfully');
  } catch (error) {
    if (error instanceof mongoose.Error) {
      LOGGER.error('MongoDB connection error:', error);
    } else {
      LOGGER.error('Unexpected error during MongoDB initialization:', error);
    }
    throw error;
  }
}

function getClient(): Connection {
  if (!global.MONGO_CLIENT || !isConnected()) {
    throw new Error(
      'MongoDB client not initialized or not connected. Call init() first.',
    );
  }
  return global.MONGO_CLIENT;
}

async function close(): Promise<void> {
  if (!global.MONGO_CLIENT) {
    LOGGER.warn('No MongoDB connection found to close');
    return;
  }

  try {
    await mongoose.disconnect();
    LOGGER.info('MongoDB connection closed successfully');
    global.MONGO_CLIENT = null;
  } catch (error) {
    LOGGER.error('Error while closing MongoDB connection:', error);
    throw error;
  }
}

function isConnected(): boolean {
  return global.MONGO_CLIENT?.readyState === 1;
}

export {
  init,
  getClient,
  close,
  isConnected,
  MongoDBConfig,
  ConnectionCredentials,
};
