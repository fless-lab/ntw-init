import { BucketItem } from 'minio';
import * as path from 'path';
import { Readable } from 'stream';
import { MinioStorageService } from '..';

describe('MinioStorageService', () => {
  let minioService: MinioStorageService;

  const TEST_BUCKET = 'test-bucket';
  const TEST_FILE_NAME = 'test-file.txt';
  const TEST_FILE_CONTENT = Buffer.from('Hello World');
  const TEST_FILE_PATH = path.join(__dirname, 'test-files', TEST_FILE_NAME);

  beforeAll(() => {
    minioService = new MinioStorageService();
    console.log('minio service : ', minioService);
  });

  beforeEach(async () => {
    try {
      const exists = await minioService.checkBucket(TEST_BUCKET);
      if (exists) {
        await minioService.deleteBucket(TEST_BUCKET, true);
      }
    } catch (error) {
      console.error('Error during setup:', error);
    }
  });

  afterEach(async () => {
    try {
      const exists = await minioService.checkBucket(TEST_BUCKET);
      if (exists) {
        await minioService.emptyBucket(TEST_BUCKET);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  afterAll(async () => {
    // Clean up test bucket after all tests
    try {
      await minioService.deleteBucket(TEST_BUCKET, true);
    } catch (error) {
      console.error('Bucket cleanup error:', error);
    }
  });

  // Bucket Operations Tests
  describe('Bucket Operations', () => {
    describe('checkBucket', () => {
      it('should return true if bucket exists', async () => {
        await minioService.createBucket(TEST_BUCKET);
        const exists = await minioService.checkBucket(TEST_BUCKET);
        expect(exists).toBe(true);
      });

      it('should return false if bucket does not exist', async () => {
        const exists = await minioService.checkBucket('non-existent-bucket');
        expect(exists).toBe(false);
      });
    });

    describe('createBucket', () => {
      it('should create a new bucket successfully', async () => {
        const result = await minioService.createBucket(TEST_BUCKET);
        expect(result.success).toBe(true);
        expect(result.code).toBe(201);
      });

      it('should return error when creating duplicate bucket', async () => {
        await minioService.createBucket(TEST_BUCKET);
        const result = await minioService.createBucket(TEST_BUCKET);
        expect(result.success).toBe(false);
        expect(result.code).toBe(409);
      });
    });

    describe('listBuckets', () => {
      it('should list all buckets', async () => {
        await minioService.createBucket(TEST_BUCKET);
        const result = await minioService.listBuckets();
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(
          result.data.some((bucket: any) => bucket.name === TEST_BUCKET),
        ).toBe(true);
      });
    });

    describe('setBucketPolicy', () => {
      it('should set bucket policy successfully', async () => {
        await minioService.createBucket(TEST_BUCKET);
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${TEST_BUCKET}/*`],
            },
          ],
        };
        const result = await minioService.setBucketPolicy(
          TEST_BUCKET,
          policy as any,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
      });
    });
  });

  // File Upload Operations Tests
  describe('File Upload Operations', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
    });

    describe('uploadSingleFile', () => {
      it('should upload file successfully', async () => {
        const result = await minioService.uploadSingleFile(
          TEST_BUCKET,
          TEST_FILE_NAME,
          TEST_FILE_PATH,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(201);
        expect(result.data).toBe(`/${TEST_BUCKET}/${TEST_FILE_NAME}`);
      });
    });

    describe('uploadBuffer', () => {
      it('should upload buffer successfully', async () => {
        const result = await minioService.uploadBuffer(
          TEST_BUCKET,
          TEST_FILE_NAME,
          TEST_FILE_CONTENT,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(201);
        expect(result.data).toBe(`/${TEST_BUCKET}/${TEST_FILE_NAME}`);
      });
    });

    describe('uploadStream', () => {
      it('should upload stream successfully', async () => {
        const stream = Readable.from(TEST_FILE_CONTENT);
        const result = await minioService.uploadStream(
          TEST_BUCKET,
          TEST_FILE_NAME,
          stream,
          TEST_FILE_CONTENT.length,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(201);
        expect(result.data).toBe(`/${TEST_BUCKET}/${TEST_FILE_NAME}`);
      });
    });
  });

  // File Operations Tests
  describe('File Operations', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
      await minioService.uploadBuffer(
        TEST_BUCKET,
        TEST_FILE_NAME,
        TEST_FILE_CONTENT,
      );
    });

    describe('copyFile', () => {
      it('should copy file successfully', async () => {
        const destFile = 'copied-file.txt';
        const result = await minioService.copyFile(
          TEST_BUCKET,
          TEST_FILE_NAME,
          TEST_BUCKET,
          destFile,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
      });
    });

    describe('moveFile', () => {
      it('should move file successfully', async () => {
        const destFile = 'moved-file.txt';
        const result = await minioService.moveFile(
          TEST_BUCKET,
          TEST_FILE_NAME,
          TEST_BUCKET,
          destFile,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);

        // Verify source file doesn't exist
        const sourceStats = await minioService.getFileStats(
          TEST_BUCKET,
          TEST_FILE_NAME,
        );
        expect(sourceStats.success).toBe(false);
      });
    });

    describe('deleteSingleFile', () => {
      it('should delete file successfully', async () => {
        const result = await minioService.deleteSingleFile(
          TEST_BUCKET,
          TEST_FILE_NAME,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
      });
    });

    describe('getFileStats', () => {
      it('should get file stats successfully', async () => {
        const result = await minioService.getFileStats(
          TEST_BUCKET,
          TEST_FILE_NAME,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(result.data.size).toBe(TEST_FILE_CONTENT.length);
      });
    });

    describe('updateFileMetadata', () => {
      it('should update file metadata successfully', async () => {
        const metadata = {
          'Content-Type': 'text/plain',
          'custom-key': 'custom-value',
        };
        const result = await minioService.updateFileMetadata(
          TEST_BUCKET,
          TEST_FILE_NAME,
          metadata,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
      });
    });
  });

  // Batch Operations Tests
  describe('Batch Operations', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
      // Upload multiple test files
      await Promise.all([
        minioService.uploadBuffer(
          TEST_BUCKET,
          'file1.txt',
          Buffer.from('content1'),
        ),
        minioService.uploadBuffer(
          TEST_BUCKET,
          'file2.txt',
          Buffer.from('content2'),
        ),
        minioService.uploadBuffer(
          TEST_BUCKET,
          'file3.txt',
          Buffer.from('content3'),
        ),
      ]);
    });

    describe('batchProcessFiles', () => {
      it('should process multiple files successfully', async () => {
        const operation = async (file: BucketItem) => {
          return await minioService.getFileStats(
            TEST_BUCKET,
            file.name as string,
          );
        };

        const result = await minioService.batchProcessFiles(
          TEST_BUCKET,
          '',
          operation,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(3);
      });
    });
  });

  // Search and Filter Operations Tests
  describe('Search and Filter Operations', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
      // Upload test files with different extensions and sizes
      await Promise.all([
        minioService.uploadBuffer(
          TEST_BUCKET,
          'doc1.txt',
          Buffer.from('content1'),
        ),
        minioService.uploadBuffer(
          TEST_BUCKET,
          'doc2.pdf',
          Buffer.from('content2'.repeat(10)),
        ),
        minioService.uploadBuffer(
          TEST_BUCKET,
          'img1.jpg',
          Buffer.from('content3'.repeat(20)),
        ),
      ]);
    });

    describe('searchFiles', () => {
      it('should search files with specific extension', async () => {
        const result = await minioService.searchFiles(TEST_BUCKET, {
          extensions: ['.txt'],
        });
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(result.data.length).toBe(1);
        expect(result.data[0].name).toBe('doc1.txt');
      });

      it('should search files within size range', async () => {
        const result = await minioService.searchFiles(TEST_BUCKET, {
          minSize: 50,
          maxSize: 200,
        });
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(2);
      });
    });
  });

  // URL Generation Tests
  describe('URL Generation', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
      await minioService.uploadBuffer(
        TEST_BUCKET,
        TEST_FILE_NAME,
        TEST_FILE_CONTENT,
      );
    });

    describe('generateTemporaryUrl', () => {
      it('should generate temporary URL successfully', async () => {
        const result = await minioService.generateTemporaryUrl(
          TEST_BUCKET,
          TEST_FILE_NAME,
          3600,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(typeof result.data).toBe('string');
        expect(result.data).toContain(TEST_BUCKET);
        expect(result.data).toContain(TEST_FILE_NAME);
      });
    });

    describe('generateUploadUrl', () => {
      it('should generate upload URL successfully', async () => {
        const result = await minioService.generateUploadUrl(
          TEST_BUCKET,
          'new-file.txt',
          3600,
        );
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(typeof result.data).toBe('string');
        expect(result.data).toContain(TEST_BUCKET);
      });
    });
  });

  // Cleanup Operations Tests
  describe('Cleanup Operations', () => {
    beforeEach(async () => {
      await minioService.createBucket(TEST_BUCKET);
      await Promise.all([
        minioService.uploadBuffer(
          TEST_BUCKET,
          'old-file.txt',
          TEST_FILE_CONTENT,
        ),
        minioService.uploadBuffer(
          TEST_BUCKET,
          'new-file.txt',
          TEST_FILE_CONTENT,
        ),
      ]);
    });

    describe('cleanup', () => {
      it('should clean up old files successfully', async () => {
        const cutoffDate = new Date();
        // Wait to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await minioService.uploadBuffer(
          TEST_BUCKET,
          'newer-file.txt',
          TEST_FILE_CONTENT,
        );

        const result = await minioService.cleanup(TEST_BUCKET, cutoffDate);
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(result.data.deletedCount).toBe(2);
      });
    });
  });
});
