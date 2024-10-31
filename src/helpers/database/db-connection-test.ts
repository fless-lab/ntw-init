import { DB } from 'core/framework';

export async function testDatabaseConnection() {
  try {
    await DB.mongo.init();
  } catch (error) {
    LOGGER.error('Failed to initialize MongoDB:', error as Error);
    throw error;
  }
}
