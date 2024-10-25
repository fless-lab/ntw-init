import { DB } from 'core/framework';

export async function testDatabaseConnection() {
  try {
    await DB.mongo.init();
    LOGGER.info('Mongodb initialised.');
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error as Error);
    throw error;
  }
}
