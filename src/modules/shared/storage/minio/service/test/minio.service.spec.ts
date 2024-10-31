import { Client } from 'minio';
import { MinioService } from '../minio.service';
import path from 'path';

const testBucketName = 'bucket2';
const testFileName = 'test.txt';
const cwd = process.cwd();
const testFilePath = path.join(
  cwd,
  'src/modules/shared/storage/minio/service/test',
  testFileName,
);
const multipleBuckets: string[] = [
  'this-bucket',
  'another-bucket2',
  'another-bucket3',
];

let minioService: MinioService;
let MINIO: Client;

describe('MinioService', () => {
  beforeAll(async () => {
    MINIO = new Client({
      endPoint: process.env.MINIO_HOST || '172.17.0.1',
      port: parseInt(process.env.MINIO_API_PORT || '5500', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minio-access-key',
      secretKey: process.env.MINIO_SECRET_KEY || 'minio-secret-key',
    });

    minioService = new MinioService(MINIO);
  });

  afterAll(async () => {
    multipleBuckets.push(testBucketName);
    // Clean up by deleting test bucket after all tests
    multipleBuckets.forEach(async (bucketName) => {
      if (await MINIO.bucketExists(bucketName)) {
        await MINIO.removeBucket(bucketName);
      }
    });
  });

  describe('createBucket', () => {
    it('should create a new bucket', async () => {
      const response = await minioService.createBucket(testBucketName);
      expect(response.success).toBe(true);
      expect(response.code).toBe(201);
    });

    it('should not recreate an existing bucket', async () => {
      await minioService.createBucket(testBucketName);
      const response = await minioService.createBucket(testBucketName);
      expect(response.success).toBe(false);
      expect(response.code).toBe(409);
    });
  });

  describe('createBuckets', () => {
    const bucketsLen = multipleBuckets.length;
    it('should create multiple buckets', async () => {
      multipleBuckets.forEach(async (bucketName) => {
        if (await MINIO.bucketExists(bucketName)) {
          await MINIO.removeBucket(bucketName);
        }
      });
      const response = await minioService.createBuckets(multipleBuckets);
      expect(response.success).toBe(true);
      expect(response.code).toBe(207);
      expect(response.message).toBe(
        `${bucketsLen} buckets created successfully, 0 failed`,
      );
    });

    it('should not recreate any existing buckets', async () => {
      await minioService.createBuckets(multipleBuckets);
      const response = await minioService.createBuckets(multipleBuckets);
      expect(response.success).toBe(true);
      expect(response.code).toBe(207);
    });
  });

  describe('uploadSingleFile', () => {
    it('should upload a file to the bucket', async () => {
      await minioService.createBucket(testBucketName);
      const response = await minioService.uploadSingleFile(
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
      const response = await minioService.getBucketFiles(testBucketName);
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
      const response = await minioService.deleteSingleFile(
        testBucketName,
        testFileName,
      );
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);

      const fileList = await minioService.getBucketFiles(testBucketName);
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
      await minioService.createBucket(testBucketName);
      await minioService.uploadSingleFile(
        testBucketName,
        folderFilePath,
        testFilePath,
      );
    });

    it('should delete all files in a folder within the bucket', async () => {
      const response = await minioService.deleteFolder(
        testBucketName,
        folderName,
      );
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);

      const folderContents = await minioService.getBucketFiles(testBucketName);
      expect(
        folderContents.data.some((file: { name: string }) =>
          file.name.startsWith(folderName),
        ),
      ).toBe(false);
    });
  });
});
