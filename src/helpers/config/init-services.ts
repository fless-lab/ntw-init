import { testDatabaseConnection } from '../database/db-connection-test';
import { testRedisConnection } from '../database/redis-test';
import { testMinioConnection } from '../storage/minio-test';

async function initServices(): Promise<void> {
  const services = [
    { name: 'Database', test: testDatabaseConnection, critical: true },
    { name: 'Redis', test: testRedisConnection, critical: false },
    { name: 'Minio', test: testMinioConnection, critical: false },
  ];

  for (const service of services) {
    if (service.critical) {
      try {
        await service.test();
        LOGGER.info(`${service.name} connection test passed.`);
      } catch (error) {
        LOGGER.error(
          `${service.name} connection failed. Application will stop.`,
          error as Error,
        );
        throw new Error(`${service.name} initialization failed`);
      }
    }
  }

  const nonCriticalServices = services.filter((service) => !service.critical);
  const results = await Promise.allSettled(
    nonCriticalServices.map((service) => service.test()),
  );

  results.forEach((result, index) => {
    const service = nonCriticalServices[index];
    if (result.status === 'fulfilled') {
      LOGGER.info(`${service.name} connection test passed.`);
    } else {
      LOGGER.warn(
        `${service.name} connection failed. Continuing without it.`,
        result.reason,
      );
    }
  });
}

export { initServices };
