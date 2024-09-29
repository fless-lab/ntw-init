import Redis from 'ioredis';

let redisClient: Redis | null = null;

function init(): void {
  if (!global.REDIS) {
    redisClient = new Redis({
      port: CONFIG.redis.port,
      host: CONFIG.redis.host,
    });

    redisClient.on('connect', () => {
      LOGGER.info('Client connected to Redis...');
    });

    redisClient.on('ready', () => {
      LOGGER.info('Client connected to Redis and ready to use...');
    });

    redisClient.on('error', (err) => {
      LOGGER.error(err.message);
    });

    redisClient.on('end', () => {
      LOGGER.warn('Client disconnected from Redis');
    });

    process.on('SIGINT', () => {
      LOGGER.info('On client quit');
      if (redisClient) {
        redisClient.quit();
      }
    });

    global.REDIS = redisClient;
  } else {
    redisClient = REDIS;
  }
}

function getClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call init() first.');
  }
  return redisClient;
}

async function close(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    LOGGER.warn('Redis connection is disconnected.');
    // global.REDIS = null;
  } else {
    LOGGER.warn('No Redis connection found to close.');
  }
}

export { init, getClient, close };
