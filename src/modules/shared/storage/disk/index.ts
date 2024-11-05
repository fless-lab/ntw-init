import crypto from 'crypto';
import fs, { promises as fsPromise } from 'fs';
import path from 'path';
import { detectFileType } from '../../../../helpers/utils/file';
import { FileMetadata } from './types';

export class DiskStorageService {
  private static uploadDir: string = path.join(process.cwd(), 'upload');

  private static handleResponse(
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

  static async CreateUploadFolder() {
    try {
      if (fs.existsSync(this.uploadDir)) {
        return this.handleResponse(false, '👌👌👌 Dossier existant', 409);
      }

      fs.mkdirSync('/home/michee/projects/system-api/ntw-init/upload');
      return this.handleResponse(true, 'Dossier créer avec succès', 201);
    } catch (error) {
      return this.handleResponse(false, 'Erreur lors de la création', 500);
    }
  }

  static async uploadFile(contentBuffer: Buffer): Promise<any> {
    try {
      await this.CreateUploadFolder();

      const hash = crypto
        .createHash('sha256')
        .update(contentBuffer)
        .digest('hex');

      const fileId = `${hash}-${Date.now()}`;
      const filePath = path.join(this.uploadDir, fileId);

      const fileType = await detectFileType(contentBuffer);

      await fsPromise.writeFile(filePath, contentBuffer);

      const fileData: FileMetadata = {
        name: fileId,
        size: contentBuffer.length,
        type: fileType,
        extension: `.${fileType || 'bin'}`,
        hash: hash,
      };

      return this.handleResponse(
        true,
        'FIchier uploader avec succes',
        201,
        fileData.name,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Erreur lors du téléchargement du fichier',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async getFile(fileId: string): Promise<any> {
    try {
      const filePath = path.join(this.uploadDir, fileId);
      const contentBuffer = await fsPromise.readFile(filePath);

      const fileType = await detectFileType(contentBuffer);

      const fileMetadata: FileMetadata = {
        name: fileId,
        size: contentBuffer.length,
        type: fileType,
        extension: fileType,
        hash: crypto.createHash('sha256').update(contentBuffer).digest('hex'),
      };

      return this.handleResponse(
        true,
        'File Recovery Successfully',
        200,
        fileMetadata,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Error when recovering files',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async listFiles(): Promise<any> {
    try {
      const files = await fsPromise.readdir(this.uploadDir);

      return this.handleResponse(true, 'File list', 200, files);
    } catch (error) {
      return this.handleResponse(
        false,
        'Error Retrieving File List',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async deleteFile(fileId: string): Promise<any> {
    try {
      const filePath = path.join(this.uploadDir, fileId);
      await fsPromise.unlink(filePath);
      return this.handleResponse(true, 'File remove successfully', 200);
    } catch (error) {
      return this.handleResponse(
        false,
        'Error during deletion',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async emptyDirectory(): Promise<any> {
    try {
      const files = await fsPromise.readdir(this.uploadDir);
      const deleteFile = files.map((files) =>
        fsPromise.unlink(path.join(this.uploadDir, files)),
      );
      await Promise.all(deleteFile);

      return this.handleResponse(
        true,
        'Le repertoire upload a été vide avec succès',
        200,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Erreur lors de la tentative de vide le repertoire',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async deleteDirectory(): Promise<any> {
    try {
      await fsPromise.rmdir(this.uploadDir);

      return this.handleResponse(
        true,
        'Le repertoire a été supprimer avec succès',
        200,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Erreur lors de la suppression du repertoire',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async copyFile(sourceId: string, destinationId: string): Promise<any> {
    try {
      const sourcePath = path.join(this.uploadDir, sourceId);
      const destinationPath = path.join(this.uploadDir, destinationId);
      await fsPromise.copyFile(sourcePath, destinationPath);

      return this.handleResponse(
        true,
        'La copie a été effectuer avec succès',
        200,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Erreur lors de la copie du fichier',
        500,
        undefined,
        error as Error,
      );
    }
  }

  static async moveFile(sourceId: string, destinationId: string): Promise<any> {
    try {
      const sourcePath = path.join(this.uploadDir, sourceId);
      const destinationPath = path.join(this.uploadDir, destinationId);
      const newName = await fsPromise.rename(sourcePath, destinationPath);

      return this.handleResponse(
        true,
        'La modification du nom du fichier a été effectuer avec succès',
        201,
        newName,
      );
    } catch (error) {
      return this.handleResponse(
        false,
        'Erreur lors de la modification du nom',
        500,
        undefined,
        error as Error,
      );
    }
  }
}
