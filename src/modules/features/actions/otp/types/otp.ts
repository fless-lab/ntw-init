import { IBaseModel } from '@nodesandbox/repo-framework';
import { Document } from 'mongoose';

export type TOTPPurpose = keyof typeof CONFIG.otp.purposes;

export interface IOTP {
  code: string;
  user: string;
  used: boolean;
  isFresh: boolean;
  expiresAt: Date;
  purpose: TOTPPurpose;
}

export interface IOTPModel extends IOTP, IBaseModel, Document {}
