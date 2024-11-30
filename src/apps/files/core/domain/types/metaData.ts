import { IBaseModel } from '@nodesandbox/repo-framework';
import { Document } from 'mongoose';

export interface IMetaData {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
}

export interface IMetaDataModel extends IBaseModel, Document {}
