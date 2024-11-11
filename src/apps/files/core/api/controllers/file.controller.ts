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

      const diskUpload = await fileService.uploadFile(payload);
      if (!diskUpload.success) {
        throw diskUpload.error;
      }

      const insertFile = {
        hash: diskUpload.arguments.hash,
        size: diskUpload.arguments.size,
        type: diskUpload.arguments.type,
        extension: diskUpload.arguments.extension,
        metadata: payload,
      };

      const response = await fileService.create(insertFile);

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
      const _payload = (await fileService.findOne({
        _id: fileId,
      })) as SuccessResponseType<IFileModel>;

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await fileService.getFileDisk(_payload);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 200);
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  // static async updateFile(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const fileId = req.params.fileId;
  //     const newFile = req.file;

  //     const checkFIle = (await fileService.findOne({
  //       _id: fileId,
  //     })) as SuccessResponseType<IFileModel>;

  //     if (!checkFIle.success) {
  //       throw checkFIle.error;
  //     }

  //     const payload = await fileService.updateFileDisk(checkFIle, newFile);
  //     if (!payload.success) {
  //       throw payload.error;
  //     }

  //     const insertFile = {
  //       hash: payload.arguments.hash,
  //       size: payload.arguments.size,
  //       type: payload.arguments.type,
  //       extension: payload.arguments.extension,
  //       metadata: newFile,
  //     };

  //     const fileUpdated = await fileService.update({_id})
  //   } catch (error) {
  //     ApiResponse.error(res, error as ErrorResponseType);
  //   }
  // }

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
      const file = req.file;

      const _payload = (await fileService.findOne({
        _id: fileId,
      })) as SuccessResponseType<IFileModel>;

      if (!_payload.success) {
        throw _payload.error;
      }
      await fileService.deleteFIleDIsk(_payload);

      const response = await fileService.delete({ _id: fileId });

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
