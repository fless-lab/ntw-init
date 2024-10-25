console.log('🟢 Setup script is running...');

import { DB } from '../../src/core/framework';
import { S3 } from '../../src/core/framework';

async function testDatabaseConnection() {
  try {
    const testUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017';
    const testDbName = process.env.TEST_MONGO_DB_NAME || 'test-db';

    await DB.mongo.init(testUri, testDbName);
    console.log('✅ MongoDB initialized for testing.');
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB for testing:', error);
    throw error;
  }
}

async function closeDatabaseConnection() {
  try {
    await DB.mongo.close();
    console.warn('🛑 MongoDB connection closed after testing.');
  } catch (error) {
    console.error('❌ Failed to close MongoDB connection:', error);
  }
}

async function testRedisConnection() {
  try {
    await DB.redis.init();
    console.log('✅ Redis initialized for testing.');
  } catch (error) {
    console.error('❌ Failed to initialize Redis for testing:', error);
    throw error;
  }
}

async function closeRedisConnection() {
  try {
    await DB.redis.close();
    console.warn('🛑 Redis connection closed after testing.');
  } catch (error) {
    console.error('❌ Failed to close Redis connection:', error);
  }
}

async function testMinioConnection() {
  try {
    const client = S3.minio.init();
    await client.listBuckets();
    console.log('✅ MinIO initialized for testing.');
  } catch (error) {
    console.error('❌ Failed to initialize MinIO for testing:', error);
    throw error;
  }
}

async function closeMinioConnection() {
  try {
    await S3.minio.close();
    console.warn('🛑 MinIO connection closed after testing.');
  } catch (error) {
    console.error('❌ Failed to close MinIO connection:', error);
  }
}

beforeAll(async () => {
  try {
    await testDatabaseConnection();
    await testRedisConnection();
    await testMinioConnection();
    console.log('🟢 All test services initialized successfully.');
  } catch (error) {
    console.error('🔴 Initialization failed for one or more services:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  console.log('🌀 Cleaning up after test.');
});

afterAll(async () => {
  await closeDatabaseConnection();
  await closeRedisConnection();
  await closeMinioConnection();
  console.log('🔴 All test services have been shut down.');
});
