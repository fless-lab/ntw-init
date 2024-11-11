import { IBaseModel } from '@nodesandbox/repo-framework';
import { Document } from 'mongoose';

export type FileStorageType = keyof typeof CONFIG.fs.stores;

export interface IFile {
  hash: string;
  type: string;
  extension: string;
  size: number;
  storageType: FileStorageType;
  locationData: string;
  path: string;
  minio: string;
  url: string;
  presignedUrlExpiration: Date;
  metadata: {};
  description: string;
  tags: Array<string>;
  accessRoles: Array<string>;
  downloadCount: string;
}

export interface IFileModel extends IFile, IBaseModel, Document {}
