import { Client } from 'minio';

let minioClient: Client | null = null;

function connect(
  endpoint: string,
  accessKey: string,
  secretKey: string,
): Client {
  minioClient = new Client({
    endPoint: endpoint,
    port: 9000,
    useSSL: false,
    accessKey,
    secretKey,
  });

  console.info('MinIO connected successfully');
  return minioClient;
}

function init(): Client {
  if (!minioClient) {
    minioClient = connect(
      CONFIG.minio.endpoint,
      CONFIG.minio.accessKey,
      CONFIG.minio.secretKey,
    );
  }
  return minioClient;
}

function getClient(): Client {
  if (!minioClient) {
    const error = new Error('Connection not initialized. Call init() first.');
    console.error(error);
    throw error;
  }

  return minioClient;
}

export { init, getClient };
