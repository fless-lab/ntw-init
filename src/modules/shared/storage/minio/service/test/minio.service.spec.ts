import { Client } from 'minio';
import { MinioService } from '../minio.service';

const testBucketName = 'bucket2';
const testFileName = 'test-file.txt';
const testFilePath = './path/to/local/test-file.txt';

describe('MinioService', () => {
  let MINIO: Client;
  beforeAll(async () => {
    MINIO = new Client({
      endPoint: process.env.MINIO_HOST || '172.17.0.1',
      port: parseInt(process.env.MINIO_API_PORT || '5500', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minio-access-key',
      secretKey: process.env.MINIO_SECRET_KEY || 'minio-secret-key',
    });
  });

  afterAll(async () => {
    // Clean up by deleting test bucket after all tests
    if (await MINIO.bucketExists(testBucketName)) {
      await MINIO.removeBucket(testBucketName);
    }
  });

  describe('createBucket', () => {
    it('should create a new bucket', async () => {
      const response = await MinioService.createBucket(testBucketName);
      expect(response.success).toBe(true);
      expect(response.code).toBe(201);
    });

    it('should not recreate an existing bucket', async () => {
      await MinioService.createBucket(testBucketName);
      const response = await MinioService.createBucket(testBucketName);
      expect(response.success).toBe(false);
      expect(response.code).toBe(409);
    });
  });

  describe('createBuckets', () => {
    const bucketNames: string[] = [
      testBucketName,
      'test-bucket2',
      'test-bucket3',
    ];
    const bucketsLen = bucketNames.length;
    it('should create multiple buckets', async () => {
      const response = await MinioService.createBuckets(bucketNames);
      expect(response.success).toBe(true);
      expect(response.code).toBe(207);
      expect(response.data).toContain(bucketsLen);
      expect(response.data).toContain('0');
    });

    it('should not recreate an existing buckets', async () => {
      await MinioService.createBuckets(bucketNames);
      const response = await MinioService.createBucket(testBucketName);
      expect(response.success).toBe(false);
      expect(response.code).toBe(500);
    });
  });

  describe('uploadSingleFile', () => {
    it('should upload a file to the bucket', async () => {
      const response = await MinioService.uploadSingleFile(
        testBucketName,
        testFileName,
        testFilePath,
      );
      expect(response.success).toBe(true);
      expect(response.code).toBe(201);
      expect(response.data).toContain(testBucketName);
    });
  });

  describe('getBucketFiles', () => {
    it('should retrieve the list of files in the bucket', async () => {
      const response = await MinioService.getBucketFiles(testBucketName);
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);
      expect(
        response.data.some(
          (file: { name: string }) => file.name === testFileName,
        ),
      ).toBe(true);
    });
  });

  describe('deleteSingleFile', () => {
    it('should delete a single file from the bucket', async () => {
      const response = await MinioService.deleteSingleFile(
        testBucketName,
        testFileName,
      );
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);

      const fileList = await MinioService.getBucketFiles(testBucketName);
      expect(
        fileList.data.some(
          (file: { name: string }) => file.name === testFileName,
        ),
      ).toBe(false);
    });
  });

  describe('deleteFolder', () => {
    const folderName = 'test-folder/';
    const folderFilePath = `${folderName}test-file.txt`;

    beforeEach(async () => {
      await MinioService.createBucket(testBucketName);
      await MinioService.uploadSingleFile(
        testBucketName,
        folderFilePath,
        testFilePath,
      );
    });

    it('should delete all files in a folder within the bucket', async () => {
      const response = await MinioService.deleteFolder(
        testBucketName,
        folderName,
      );
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);

      const folderContents = await MinioService.getBucketFiles(testBucketName);
      expect(
        folderContents.data.some((file: { name: string }) =>
          file.name.startsWith(folderName),
        ),
      ).toBe(false);
    });
  });

  describe('deleteBucket', () => {
    it('should delete the entire bucket', async () => {
      const response = await MinioService.deleteFolder(testBucketName, '');
      expect(response.success).toBe(true);

      // Check if bucket no longer exists
      const exists = await MINIO.bucketExists(testBucketName);
      expect(exists).toBe(false);
    });
  });
});
