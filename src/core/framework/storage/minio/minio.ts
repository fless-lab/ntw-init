import { Client as MinioClient } from 'minio';

let minioClient: MinioClient | null = null;

function init(): MinioClient {
  if (!global.MINIO) {
    minioClient = new MinioClient({
      endPoint: CONFIG.minio.host,
      port: CONFIG.minio.apiPort,
      useSSL: CONFIG.minio.useSSL,
      accessKey: CONFIG.minio.accessKey,
      secretKey: CONFIG.minio.secretKey,
    });

    LOGGER.info('Minio connected - Waiting for test...');
    global.MINIO = minioClient;
  } else {
    minioClient = global.MINIO;
  }

  return minioClient;
}

function getClient(): MinioClient {
  if (!global.MINIO) {
    throw new Error('Minio client not initialized. Call initMinio() first.');
  }
  return global.MINIO;
}

function close(): void {
  if (global.MINIO) {
    minioClient = null;
    LOGGER.warn('Minio connection is closed.');
    // global.MINIO = null;
  } else {
    LOGGER.warn('No MinIO connection to close.');
  }
}

export { init, getClient, close };
