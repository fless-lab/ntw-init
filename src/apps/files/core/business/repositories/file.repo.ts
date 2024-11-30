import { BaseRepository } from '@nodesandbox/repo-framework';
import { Model } from 'mongoose';
import { IFileModel } from '../../domain';

export class FileRepository extends BaseRepository<IFileModel> {
  constructor(model: Model<IFileModel>) {
    super(model);
  }
}
