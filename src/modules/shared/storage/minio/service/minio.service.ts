import { BucketItem } from 'minio';

export class MinioService {
  /**
   * 
    create a constructor that will ask for a minio instance.. default give out MINIO...
    In test create an instance of this service and give him the client
   */
  // Create a single bucket
  static async createBucket(bucketName: string): Promise<any> {
    try {
      const bucketExists = await this.checkBucket(bucketName);

      if (bucketExists) {
        return {
          success: false,
          message: 'Bucket already exists',
          code: 409,
        };
      } else {
        await MINIO.makeBucket(bucketName);
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
  static async createBuckets(bucketNames: string[]): Promise<any> {
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
  static async checkBucket(bucketName: string): Promise<boolean> {
    try {
      const bucketExists = await MINIO.bucketExists(bucketName);
      return bucketExists;
    } catch {
      return false;
    }
  }

  // Upload a single file to a bucket and return its URL
  static async uploadSingleFile(
    bucketName: string,
    fileName: string,
    filePath: string,
  ): Promise<any> {
    try {
      await MINIO.fPutObject(bucketName, fileName, filePath);
      const fileUrl = await MINIO.presignedGetObject(
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

  static async uploadSingleFile2(
    bucket: string,
    fileName: string,
    filePath: string,
    type = 'image/jpeg',
  ): Promise<any> {
    try {
      await MINIO.fPutObject(bucket, fileName, filePath, {
        'Content-Type': type,
      });

      const filePathUrl = `/${bucket}/${fileName}`;

      return { success: true, data: filePathUrl };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Upload multiple files to a bucket and return their URLs
  static async uploadMultipleFiles(
    bucketName: string,
    files: { fileName: string; path: string }[],
  ): Promise<any> {
    try {
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          await MINIO.fPutObject(bucketName, file.fileName, file.path);
          const fileUrl = await MINIO.presignedGetObject(
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
  static async getFileUrl(bucketName: string, fileName: string): Promise<any> {
    try {
      const url = await MINIO.presignedGetObject(
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
  static async deleteSingleFile(
    bucketName: string,
    fileName: string,
  ): Promise<any> {
    try {
      await MINIO.removeObject(bucketName, fileName);
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
  static async deleteMultipleFiles(
    bucketName: string,
    objectsList: string[],
  ): Promise<any> {
    try {
      await MINIO.removeObjects(bucketName, objectsList);
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
  static async getBucketFiles(bucketName: string): Promise<any> {
    try {
      const objects: BucketItem[] = [];
      const stream = MINIO.listObjects(bucketName, '', true);
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
  static async deleteFolder(
    bucketName: string,
    folderPath: string,
  ): Promise<any> {
    try {
      const objectsList: string[] = [];
      const stream = MINIO.listObjects(bucketName, folderPath, true);
      for await (const obj of stream) {
        objectsList.push(obj.name);
      }
      if (objectsList.length > 0) {
        await MINIO.removeObjects(bucketName, objectsList);
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
