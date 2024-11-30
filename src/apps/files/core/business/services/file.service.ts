/* eslint-disable prettier/prettier */
import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { decryptAES, parseSortParam } from 'helpers';
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

  async createFile(file: any) {
    try {
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

  async getFilesDB(
    filters: Record<string, any>,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    const {
      page = 1,
      limit = 10,
      sort,
      search = '',
      name,
      type,
      extension,
    } = filters;

    const query: any = {};
    if (name) query.name = name;
    if (type) query.type = type;
    if (extension) query.extension = extension;

    const sortObject = sort ? parseSortParam(sort) : {};

    return this.findAll({
      query,
      sort: sortObject,
      page: parseInt(page),
      limit: parseInt(limit),
      searchTerm: search as string,
    });
  }

  async getFileDIsk(
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    const payload = await this.repository.findOne({ _id: fileId });
    // TODO Gerer les erreurs liés au fichier introuvable avec (if) apres la modification du package ErrorResponseType

    const hash = payload?.hash as string;

    const fileDiskName = decryptAES(
      hash,
      process.env.CRYPTAGE_KEY || 'secret-key',
    );

    const response = await storage.disk.getFile(fileDiskName);

    return { success: true, document: response };
  }

  async sendFile(
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
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

      response.data.mimetype = (file.metadata as { mimetype: string }).mimetype;

      return { success: true, document: response.data };
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

  async deleteFIle(
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    try {
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

export default new FileService();
