import FileService from 'apps/files/core/business/services/file.service';
import fs from 'fs';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApiResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { IFileModel } from 'apps/files';
import { NextFunction, Request, Response } from 'express';

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
      const service = CONFIG.fs.defaultStore;

      const fileService = new FileService();
      const response = await fileService.createFIle(service, payload);
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
  static async getFileById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const service = CONFIG.fs.defaultStore;

      const fileService = new FileService();
      const response = (await fileService.getFile(
        service,
        fileId,
      )) as SuccessResponseType<IFileModel>;

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response.error;
      }
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  static async downloadFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const service = CONFIG.fs.defaultStore;

      const fileService = new FileService();
      const response = (await fileService.sendFile(
        service,
        fileId,
      )) as SuccessResponseType<IFileModel>;

      if (!response.success) {
        throw response.error;
      }

      // TODO Corriger le telechargement des vidéos
      res.writeHead(200, {
        'content-type': response.document?.mimetype,
        'content-length': response.document?.size,
      });

      const filepath = response.document?.path as string;
      const file = fs.readFileSync(filepath);
      res.end(file);
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
  static async deleteFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const service = CONFIG.fs.defaultStore;

      const fileService = new FileService();
      const response = await fileService.deleteFile(service, fileId);

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
}
