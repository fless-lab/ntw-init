import { Document } from 'mongoose';

export interface IBaseModel extends Document {
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  __version__?: number;
  [key: string]: any;
}
