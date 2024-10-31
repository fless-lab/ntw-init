export class MinioStorageService {
  private minioClient: typeof MINIO;

  constructor() {
    // Use the existing authenticated global client if available
    if (typeof MINIO !== 'undefined') {
      this.minioClient = MINIO;
    } else {
      // Optionally, throw an error or create a new client as a fallback
      throw new Error('Global MINIO client is not defined');
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
