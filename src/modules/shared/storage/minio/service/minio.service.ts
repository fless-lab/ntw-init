import { BucketItem } from 'minio';
import { Client } from 'minio';

export class MinioService {
  client: Client;

  constructor(minioClient: Client = MINIO) {
    this.client = minioClient;
  }

  // Create a single bucket
  async createBucket(bucketName: string): Promise<any> {
    try {
      const bucketExists = await this.checkBucket(bucketName);

      if (bucketExists) {
        return {
          success: false,
          message: 'Bucket already exists',
          code: 409,
        };
      } else {
        await this.client.makeBucket(bucketName);
        return {
          success: true,
          message: 'Bucket created successfully',
          code: 201,
        };
      }
    } catch (error) {
      console.log('error occured', error);
      return {
        success: false,
        message: 'An error occurred while creating the bucket',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Create multiple buckets
  async createBuckets(bucketNames: string[]): Promise<any> {
    try {
      const results = await Promise.all(
        bucketNames.map((bucketName) => this.createBucket(bucketName)),
      );
      const successfulCreations = results.filter(
        (result) => result.success,
      ).length;
      const failedCreations = results.length - successfulCreations;
      return {
        success: true,
        message: `${successfulCreations} buckets created successfully, ${failedCreations} failed`,
        results,
        code: 207,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while creating multiple buckets',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Check if a bucket exists
  async checkBucket(bucketName: string): Promise<boolean> {
    try {
      const bucketExists = await this.client.bucketExists(bucketName);
      return bucketExists;
    } catch {
      return false;
    }
  }

  // Upload a single file to a bucket and return its URL
  async uploadSingleFile(
    bucketName: string,
    fileName: string,
    filePath: string,
  ): Promise<any> {
    try {
      await this.client.fPutObject(bucketName, fileName, filePath);
      const fileUrl = await this.client.presignedGetObject(
        bucketName,
        fileName,
        24 * 60 * 60,
      );

      return {
        success: true,
        message: 'File uploaded successfully',
        code: 201,
        data: fileUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while uploading the file',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  async uploadSingleFile2(
    bucket: string,
    fileName: string,
    filePath: string,
    type = 'image/jpeg',
  ): Promise<any> {
    try {
      await this.client.fPutObject(bucket, fileName, filePath, {
        'Content-Type': type,
      });

      const filePathUrl = `/${bucket}/${fileName}`;

      return { success: true, data: filePathUrl };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Upload multiple files to a bucket and return their URLs
  async uploadMultipleFiles(
    bucketName: string,
    files: { fileName: string; path: string }[],
  ): Promise<any> {
    try {
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          await this.client.fPutObject(bucketName, file.fileName, file.path);
          const fileUrl = await this.client.presignedGetObject(
            bucketName,
            file.fileName,
            24 * 60 * 60,
          );
          return { filename: file.fileName, url: fileUrl };
        }),
      );
      return {
        success: true,
        message: 'Files uploaded successfully',
        code: 201,
        data: uploadResults,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while uploading files',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Get a presigned URL for a file
  async getFileUrl(bucketName: string, fileName: string): Promise<any> {
    try {
      const url = await this.client.presignedGetObject(
        bucketName,
        fileName,
        24 * 60 * 60,
      );
      return {
        success: true,
        message: 'File URL generated successfully',
        code: 200,
        data: url,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while generating the file URL',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Delete a single file from a bucket
  async deleteSingleFile(bucketName: string, fileName: string): Promise<any> {
    try {
      await this.client.removeObject(bucketName, fileName);
      return {
        success: true,
        message: 'File deleted successfully',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting the file',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Delete multiple files from a bucket
  async deleteMultipleFiles(
    bucketName: string,
    objectsList: string[],
  ): Promise<any> {
    try {
      await this.client.removeObjects(bucketName, objectsList);
      return {
        success: true,
        message: 'Files deleted successfully',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting files',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Get a list of files in a bucket
  async getBucketFiles(bucketName: string): Promise<any> {
    try {
      const objects: BucketItem[] = [];
      const stream = this.client.listObjects(bucketName, '', true);
      for await (const obj of stream) {
        objects.push(obj);
      }
      return {
        success: true,
        message: 'Bucket files retrieved successfully',
        code: 200,
        data: objects,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while retrieving bucket files',
        error: (error as Error).message,
        code: 500,
      };
    }
  }

  // Delete a folder in a bucket
  async deleteFolder(bucketName: string, folderPath: string): Promise<any> {
    try {
      const objectsList: string[] = [];
      const stream = this.client.listObjects(bucketName, folderPath, true);
      for await (const obj of stream) {
        objectsList.push(obj.name);
      }
      if (objectsList.length > 0) {
        await this.client.removeObjects(bucketName, objectsList);
      }
      return {
        success: true,
        message: 'Folder deleted successfully',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting the folder',
        error: (error as Error).message,
        code: 500,
      };
    }
  }
}
