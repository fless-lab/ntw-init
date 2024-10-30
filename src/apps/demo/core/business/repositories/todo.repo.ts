import { Model } from 'mongoose';
import { BaseRepository } from '@nodesandbox/repo-framework';
import { ITodoModel } from 'apps/demo/core/domain';

export class TodoRepository extends BaseRepository<ITodoModel> {
  constructor(model: Model<ITodoModel>) {
    super(model);
  }

  async findIncomplete(): Promise<ITodoModel[]> {
    return this.model.find({ completed: false }).exec();
  }

  async findByPriority(priority: string): Promise<ITodoModel[]> {
    return this.model.find({ priority }).exec();
  }
}
