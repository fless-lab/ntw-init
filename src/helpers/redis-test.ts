import { DB } from '../core/framework';

export async function testRedisConnection() {
  try {
    DB.redis.init();
    REDIS.ping();
    LOGGER.info('Redis is successfully connected and working.');
  } catch (error) {
    console.error('Redis connection error:', error as any);
    throw error;
  }
}
