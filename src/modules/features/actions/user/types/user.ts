import { IBaseModel } from '@nodesandbox/repo-framework';

export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  verified: boolean;
  active: boolean;
}

export interface IUserModel extends IUser, IBaseModel, Document {}
