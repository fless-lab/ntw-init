import fs from 'fs';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApiResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { NextFunction, Request, Response } from 'express';
import { decryptAES } from 'helpers';
import fileService from '../../business/services/file.service';
import { IFileModel } from '../../domain';

export class FileController {
  /**
   * @param req
   * @param res
   * @param next
   */
  static async createFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = req.file;
      // const fileService  = new FileService(source:CONFIG.file)
      const response = await fileService.createFile(payload);
      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * @param req
   * @param res
   * @param next
   */
  static async getFilesDB(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = req.query;
      const response = await fileService.getFilesDB(filters);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response.error;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * @param req
   * @param res
   * @param next
   */
  static async getFileById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const response = await fileService.getFileDIsk(fileId);
      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 200);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async downloadFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;

      const response = (await fileService.sendFile(
        fileId,
      )) as SuccessResponseType<IFileModel>;

      if (!response.success) {
        throw response.error;
      }

      res.writeHead(200, {
        'content-type': response.document?.mimetype,
        'content-length': response.document?.size,
      });

      const filepath = response.document?.path as string;
      const file = fs.readFileSync(filepath);
      res.end(file);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  /**
   * @param req
   * @param res
   * @param next
   */
  static async deleteFileAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;

      const response = await fileService.deleteFIle(fileId);

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response.error;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}
