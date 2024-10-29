import { BaseRepository } from '@nodesandbox/repo-framework';
import { IUserModel } from '../types';
import { Model } from 'mongoose';

export class UserRepository extends BaseRepository<IUserModel> {
  constructor(model: Model<IUserModel>) {
    super(model);
  }
}
