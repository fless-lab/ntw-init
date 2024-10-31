import { Client } from 'minio';

export class MinioStorageService {
  private minioClient: Client;

  constructor(client?: Client) {
    if (client) {
      this.minioClient = client;
    } else if (typeof MINIO !== 'undefined') {
      this.minioClient = MINIO;
    } else {
      this.minioClient = new Client({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'YOUR_ACCESS_KEY',
        secretKey: 'YOUR_SECRET_KEY',
      });
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    file: Buffer,
  ): Promise<void> {
    await this.minioClient.putObject(bucketName, fileName, file);
  }

  async getFile(bucketName: string, fileName: string): Promise<Buffer> {
    const dataStream = await this.minioClient.getObject(bucketName, fileName);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: any[] = [];
      dataStream.on('data', (chunk) => chunks.push(chunk));
      dataStream.on('end', () => resolve(Buffer.concat(chunks)));
      dataStream.on('error', reject);
    });
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }
}
