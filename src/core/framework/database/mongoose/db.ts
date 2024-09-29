import mongoose, { Connection } from 'mongoose';

async function connect(uri: string, dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(uri, { dbName })
      .then(() => {
        global.MONGO_CLIENT = mongoose.connection;
        LOGGER.info('Mongoose connected to db');
        resolve();
      })
      .catch((err: mongoose.Error) => {
        LOGGER.error('Mongoose connection error:', err);
        reject(err);
      });
  });
}

async function init(
  uri: string = CONFIG.db.uri,
  dbName: string = CONFIG.db.name,
): Promise<void> {
  try {
    if (!global.MONGO_CLIENT) {
      await connect(uri, dbName);
      LOGGER.info('MongoDB initialized.');
    } else {
      LOGGER.info('MongoDB client already initialized.');
    }
  } catch (err: unknown) {
    if (err instanceof mongoose.Error) {
      LOGGER.error('Connection error:', err);
    } else {
      LOGGER.error('Unexpected error:', err as Error);
    }
    throw err;
  }
}

function getClient(): Connection {
  if (!global.MONGO_CLIENT) {
    throw new Error('MongoDB client not initialized. Call init() first.');
  }
  return global.MONGO_CLIENT;
}

async function close(): Promise<void> {
  if (global.MONGO_CLIENT) {
    await mongoose.disconnect();
    LOGGER.warn('Mongoose connection is disconnected.');
    global.MONGO_CLIENT = null;
  } else {
    LOGGER.warn('No MongoDB connection found to close.');
  }
}

export { init, getClient, close };
