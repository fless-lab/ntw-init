/* eslint-disable prettier/prettier */
import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { decryptAES, encryptAES } from 'helpers';
import { storage } from 'modules/shared/storage';
import { FileModel, IFileModel } from '../../domain';
import { FileRepository } from '../repositories';

class FileService extends BaseService<IFileModel, FileRepository> {
  constructor() {
    const fileRepo = new FileRepository(FileModel);
    super(fileRepo, false);

    this.allowedFilterFields = ['type', 'storageType'];
    this.searchFields = ['name', 'extension', 'size', 'type'];
  }

  async createFIle(
    service: any,
    file: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
      if (service !== CONFIG.minio.host) {
        const meta = file;
        const buffer = file.buffer;

        const payload = await storage.disk.uploadFile(buffer);

        const insertFile = {
          hash: payload.data.hash,
          size: payload.data.size,
          type: payload.data.type,
          extension: payload.data.extension,
          metadata: meta,
        };

        const response = await this.repository.create(insertFile);

        return { success: true, document: response };
      } else {
        const meta = file;

        await storage.minio.createBucket(CONFIG.minio.bucketName);
        const payload = await storage.minio.uploadBuffer(
          CONFIG.minio.bucketName,
          meta.originalname,
          meta.buffer,
          { ...meta, buffer: undefined },
        );
        if (!payload.success) {
          throw payload.error;
        }
        const hashedName = encryptAES(
          meta.originalname,
          process.env.CRYPTAGE_KEY || 'secret-key',
        );
        const insertFile = {
          hash: hashedName,
          size: meta.size,
          type: meta.mimetype,
          metadata: meta,
          url: payload.data,
        };
        const response = await this.repository.create(insertFile);

        return { success: true, document: response };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async getFile(
    service: any,
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
      if (service !== CONFIG.minio.host) {
        const payload = await this.repository.findOne({ _id: fileId });
        // TODO Gerer les erreurs liés au fichier introuvable avec (if) apres la modification du package ErrorResponseType

        const hash = payload?.hash as string;

        const fileDiskName = decryptAES(
          hash,
          process.env.CRYPTAGE_KEY || 'secret-key',
        );

        const response = await storage.disk.getFile(fileDiskName);

        return { success: true, document: response };
      } else {
        console.log('❌❌❌❌❌❌');
        const file = await this.repository.findOne({ _id: fileId });

        if (!file) {
          throw file;
        }

        file.originalname = (
          file.metadata as { originalname: string }
        ).originalname;
        const { originalname } = file;

        const payload = await storage.minio.getFileStats(
          CONFIG.minio.bucketName,
          originalname,
        );

        return { success: true, document: payload };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async sendFile(
    service: any,
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
      if (service !== CONFIG.minio.host) {
        const file = await this.repository.findOne({ _id: fileId });

        // TODO Gerer les erreurs liés au fichier introuvable avec (if) apres la modification du package ErrorResponseType
        if (!file) {
          throw file;
        }
        const fileDiskName = decryptAES(
          file.hash,
          process.env.CRYPTAGE_KEY || 'secret-key',
        );

        const response = await storage.disk.getFile(fileDiskName);
        if (!response.success) {
          throw response.error;
        }

        response.data.mimetype = (
          file.metadata as { mimetype: string }
        ).mimetype;

        return { success: true, document: response.data };
      } else {
        const file = await this.repository.findOne({ _id: fileId });

        if (!file) {
          throw file;
        }

        file.originalname = (
          file.metadata as { originalname: string }
        ).originalname;
        const { originalname } = file;

        const payload = await storage.minio.downloadFile(
          CONFIG.minio.bucketName,
          originalname,
          file.url,
        );

        const response = {
          path: payload.data?.path,
          mimetype: file.type,
          size: file.size,
        } as any;

        return { success: true, document: response };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async deleteFile(
    service: any,
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
      if (service !== CONFIG.minio.host) {
        const payload = await this.repository.findOne({ _id: fileId });

        // TODO Gerer les erreurs liés au fichier introuvable avec (if) apres la modification du package ErrorResponseType

        const hash = payload?.hash as string;

        const fileDiskName = decryptAES(
          hash,
          process.env.CRYPTAGE_KEY || 'secret-key',
        );

        await storage.disk.deleteFile(fileDiskName);

        await this.repository.delete({ _id: fileId });

        return { success: true };
      } else {
        const file = await this.repository.findOne({ _id: fileId });

        if (!file) {
          throw file;
        }

        file.originalname = (
          file.metadata as { originalname: string }
        ).originalname;
        const { originalname } = file;

        const payload = await storage.minio.deleteSingleFile(
          CONFIG.minio.bucketName,
          originalname,
        );

        if (!payload) {
          throw payload;
        }

        await this.repository.delete({ _id: fileId });

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }
}

export default FileService;
