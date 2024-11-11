/* eslint-disable prettier/prettier */
import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { decryptAES, parseSortParam } from 'helpers';
import { DiskStorageService } from 'modules/shared/storage/disk';
import { FileModel, FileStorageType, IFileModel } from '../../domain';
import { FileRepository } from '../repositories';

export interface FileData {
  name: string;
  size: number;
  type?: string;
  extension?: string;
  storageType?: FileStorageType;
  url: string;
  fileHash?: any;
}

class FileService extends BaseService<IFileModel, FileRepository> {
  constructor() {
    const fileRepo = new FileRepository(FileModel);
    super(fileRepo, false);

    this.allowedFilterFields = ['type', 'storageType'];
    this.searchFields = ['name', 'extension', 'size', 'type'];
  }

  async uploadFile(file: any) {
    try {
      const buffer = file.buffer;

      const payload = await DiskStorageService.uploadFile(buffer);

      return { success: true, arguments: payload.data };
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

  async getFileDisk(
    payload: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    const fileDiskName = decryptAES(
      payload.document?.hash,
      process.env.CRYPTAGE_KEY || 'secret-key',
    );

    const response = await DiskStorageService.getFile(fileDiskName);

    if (!response) {
      throw response;
    }

    console.log('⚔️⚔️⚔️⚔️⚔️ ', response);

    return { success: true, document: response };
  }

  // async updateFileDisk(
  //   fileId: any,
  //   file: any,
  // ) {
  //   try {
  //     const newContent = file.buffer

  //     const fileDiskName = decryptAES(fileId.document?.hash, process.env.CRYPTAGE_KEY || 'secret-key')

  //     await DiskStorageService.deleteFile(fileDiskName)

  //     const fileUpdate = (await DiskStorageService.uploadFile(newContent))

  //     return { success: true, arguments: fileUpdate.data };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error:
  //         error instanceof ErrorResponse
  //           ? error
  //           : new ErrorResponse(
  //               'INTERNAL_SERVER_ERROR',
  //               (error as Error).message,
  //             ),
  //     };
  //   }
  // }

  async deleteFIleDIsk(
    fileId: any,
  ): Promise<SuccessResponseType<IFileModel> | ErrorResponseType> {
    const fileDiskName = decryptAES(
      fileId.document?.hash,
      process.env.CRYPTAGE_KEY || 'secret-key',
    );

    await DiskStorageService.deleteFile(fileDiskName),
      console.log('☂️☂️☂️☂️❌❌❌❌❌ file delete ', fileDiskName);

    return { success: true };
  }
}

export default new FileService();
