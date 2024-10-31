import { DB } from 'core/framework';

export async function testRedisConnection() {
  try {
    DB.redis.init();
    REDIS.ping();
  } catch (error) {
    LOGGER.error('Redis connection error:', error as any);
    throw error;
  }
}
