import { BucketItem, Client, CopyConditions, ItemBucketMetadata } from 'minio';
import * as path from 'path';
import { Readable } from 'stream';
import { BucketPolicy, FileStats } from './types';

export class MinioStorageService {
  private minioClient: Client;
  private readonly defaultExpiry = 24 * 60 * 60;

  constructor(client?: Client) {
    if (client) {
      this.minioClient = client;
    } else if (typeof MINIO !== 'undefined') {
      this.minioClient = MINIO;
    } else {
      this.minioClient = new Client({
        endPoint: process.env.MINIO_HOST || '172.17.64.1',
        port: parseInt(process.env.MINIO_API_PORT || '5500', 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minio-access-key',
        secretKey: process.env.MINIO_SECRET_KEY || 'minio-secret-key',
      });
    }
  }

  private handleResponse(
    success: boolean,
    message: string,
    code: number,
    data?: any,
    error?: Error,
  ): any {
    return {
      success,
      message,
      code,
      ...(data && { data }),
      ...(error && { error: error.message }),
    };
  }

  async checkBucket(bucketName: string): Promise<boolean> {
    try {
      return await this.minioClient.bucketExists(bucketName);
    } catch {
      return false;
    }
  }

  async createBucket(bucketName: string, region = 'us-east-1'): Promise<any> {
    try {
      const bucketExists = await this.checkBucket(bucketName);
      if (bucketExists) {
        return this.handleResponse(false, 'Bucket already exists', 409);
      }
      await this.minioClient.makeBucket(bucketName, region);
      return this.handleResponse(true, 'Bucket created successfully', 201);
    } catch (error) {
      console.log('error occurred', error);
      return this.handleResponse(
        false,
        'An error occurred while creating the bucket',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async listBuckets(): Promise<any> {
    try {
      const buckets = await this.minioClient.listBuckets();
      return this.handleResponse(
        true,
        'Buckets retrieved successfully',
        200,
        buckets,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while listing buckets',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async setBucketPolicy(
    bucketName: string,
    policy: BucketPolicy,
  ): Promise<any> {
    try {
      await this.minioClient.setBucketPolicy(
        bucketName,
        JSON.stringify(policy),
      );
      return this.handleResponse(true, 'Bucket policy set successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while setting bucket policy',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async emptyBucket(bucketName: string): Promise<void> {
    const objects = this.minioClient.listObjects(bucketName, '', true);
    for await (const obj of objects) {
      await this.minioClient.removeObject(bucketName, obj.name);
    }
  }

  async deleteBucket(
    bucketName: string,
    forceDeleteContents = false,
  ): Promise<any> {
    try {
      if (forceDeleteContents) {
        await this.emptyBucket(bucketName);
      }
      await this.minioClient.removeBucket(bucketName);
      return this.handleResponse(true, 'Bucket deleted successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while deleting the bucket',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async uploadSingleFile(
    bucket: string,
    fileName: string,
    filePath: string,
    metadata: ItemBucketMetadata = {},
    contentType = 'application/octet-stream',
  ): Promise<any> {
    try {
      await this.minioClient.fPutObject(bucket, fileName, filePath, {
        'Content-Type': contentType,
        ...metadata,
      });
      const filePathUrl = `/${bucket}/${fileName}`;
      return this.handleResponse(
        true,
        'File uploaded successfully',
        201,
        filePathUrl,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while uploading the file',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async uploadBuffer(
    bucket: string,
    fileName: string,
    buffer: Buffer,
    metadata: ItemBucketMetadata = {},
    contentType = 'application/octet-stream',
  ): Promise<any> {
    try {
      await this.minioClient.putObject(
        bucket,
        fileName,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType,
          ...metadata,
        },
      );
      const filePathUrl = `/${bucket}/${fileName}`;
      return this.handleResponse(
        true,
        'Buffer uploaded successfully',
        201,
        filePathUrl,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while uploading buffer',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async uploadStream(
    bucket: string,
    fileName: string,
    stream: Readable,
    size: number,
    metadata: ItemBucketMetadata = {},
    contentType = 'application/octet-stream',
  ): Promise<any> {
    try {
      await this.minioClient.putObject(bucket, fileName, stream, size, {
        'Content-Type': contentType,
        ...metadata,
      });
      const filePathUrl = `/${bucket}/${fileName}`;
      return this.handleResponse(
        true,
        'Stream uploaded successfully',
        201,
        filePathUrl,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while uploading stream',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async copyFile(
    sourceBucket: string,
    sourceFile: string,
    destinationBucket: string,
    destinationFile: string,
  ): Promise<any> {
    try {
      const conditions = new CopyConditions();
      await this.minioClient.copyObject(
        destinationBucket,
        destinationFile,
        `/${sourceBucket}/${sourceFile}`,
        conditions,
      );
      return this.handleResponse(true, 'File copied successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while copying the file',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async moveFile(
    sourceBucket: string,
    sourceFile: string,
    destinationBucket: string,
    destinationFile: string,
  ): Promise<any> {
    try {
      await this.copyFile(
        sourceBucket,
        sourceFile,
        destinationBucket,
        destinationFile,
      );
      await this.deleteSingleFile(sourceBucket, sourceFile);
      return this.handleResponse(true, 'File moved successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while moving the file',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async deleteSingleFile(bucketName: string, fileName: string): Promise<any> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      return this.handleResponse(true, 'File deleted successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while deleting the file',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async getFileStats(bucketName: string, fileName: string): Promise<any> {
    try {
      const stat = await this.minioClient.statObject(bucketName, fileName);
      const fileStats: FileStats = {
        size: stat.size,
        lastModified: stat.lastModified,
        contentType:
          stat.metaData['content-type'] || 'application/octet-stream',
        metadata: stat.metaData,
      };
      return this.handleResponse(
        true,
        'File stats retrieved successfully',
        200,
        fileStats,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while getting file stats',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async updateFileMetadata(
    bucketName: string,
    fileName: string,
    metadata: ItemBucketMetadata,
  ): Promise<any> {
    try {
      const { metaData } = await this.minioClient.statObject(
        bucketName,
        fileName,
      );

      const newMetadata: { [key: string]: any } = { ...metaData, ...metadata };
      const contentType =
        newMetadata['content-type'] || 'application/octet-stream';

      await this.minioClient.putObject(
        bucketName,
        fileName,
        Buffer.from(''),
        0,
        {
          ...newMetadata,
          'Content-Type': contentType,
        },
      );

      return this.handleResponse(
        true,
        'File metadata updated successfully',
        200,
      );
    } catch (error) {
      console.error('updateFileMetadata error', error);
      return this.handleResponse(
        false,
        'An error occurred while updating file metadata',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async batchProcessFiles(
    bucketName: string,
    prefix: string,
    operation: (file: BucketItem) => Promise<any>,
  ): Promise<any> {
    try {
      const results: any[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix, true);

      for await (const file of stream) {
        try {
          const result = await operation(file);
          results.push({ file: file.name, success: true, result });
        } catch (error) {
          results.push({
            file: file.name,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      return this.handleResponse(
        true,
        'Batch operation completed',
        200,
        results,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred during batch operation',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async downloadFile(
    bucketName: string,
    fileName: string,
    destinationPath: string,
  ): Promise<any> {
    try {
      await this.minioClient.fGetObject(bucketName, fileName, destinationPath);
      return this.handleResponse(true, 'File downloaded successfully', 200, {
        path: destinationPath,
      });
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while downloading the file',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async getFileStream(bucketName: string, fileName: string): Promise<any> {
    try {
      const stream = await this.minioClient.getObject(bucketName, fileName);
      return this.handleResponse(
        true,
        'File stream retrieved successfully',
        200,
        stream,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while getting file stream',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async searchFiles(
    bucketName: string,
    options: {
      prefix?: string;
      recursive?: boolean;
      extensions?: string[];
      modifiedAfter?: Date;
      modifiedBefore?: Date;
      minSize?: number;
      maxSize?: number;
    },
  ): Promise<any> {
    try {
      const files: BucketItem[] = [];
      const stream = this.minioClient.listObjects(
        bucketName,
        options.prefix || '',
        options.recursive ?? true,
      );

      for await (const file of stream) {
        let include = true;

        if (options.extensions?.length) {
          const ext = path.extname(file.name).toLowerCase();
          include = options.extensions.includes(ext);
        }

        if (include && options.modifiedAfter) {
          include = file.lastModified >= options.modifiedAfter;
        }

        if (include && options.modifiedBefore) {
          include = file.lastModified <= options.modifiedBefore;
        }

        if (include && options.minSize !== undefined) {
          include = file.size >= options.minSize;
        }

        if (include && options.maxSize !== undefined) {
          include = file.size <= options.maxSize;
        }

        if (include) {
          files.push(file);
        }
      }

      return this.handleResponse(
        true,
        'Files searched successfully',
        200,
        files,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while searching files',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async generateTemporaryUrl(
    bucketName: string,
    fileName: string,
    expirySeconds: number = this.defaultExpiry,
    reqParams: { [key: string]: string } = {},
  ): Promise<any> {
    try {
      const url = await this.minioClient.presignedGetObject(
        bucketName,
        fileName,
        expirySeconds,
        reqParams,
      );
      return this.handleResponse(
        true,
        'Temporary URL generated successfully',
        200,
        url,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while generating temporary URL',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async generateUploadUrl(
    bucketName: string,
    fileName: string,
    expirySeconds: number = this.defaultExpiry,
  ): Promise<any> {
    try {
      const url = await this.minioClient.presignedPutObject(
        bucketName,
        fileName,
        expirySeconds,
      );
      return this.handleResponse(
        true,
        'Upload URL generated successfully',
        200,
        url,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred while generating upload URL',
        500,
        undefined,
        error as Error,
      );
    }
  }

  async cleanup(bucketName: string, olderThan: Date): Promise<any> {
    try {
      const stream = this.minioClient.listObjects(bucketName, '', true);
      const objectsToDelete: string[] = [];

      for await (const obj of stream) {
        if (obj.lastModified < olderThan) {
          objectsToDelete.push(obj.name);
        }
      }

      if (objectsToDelete.length > 0) {
        await this.minioClient.removeObjects(bucketName, objectsToDelete);
      }

      return this.handleResponse(
        true,
        `Cleaned up ${objectsToDelete.length} files`,
        200,
        { deletedCount: objectsToDelete.length },
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'An error occurred during cleanup',
        500,
        undefined,
        error as Error,
      );
    }
  }
}
