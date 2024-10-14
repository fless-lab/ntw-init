import { Model } from 'mongoose';
import { ITodoModel } from '../types';
import { EntityCoreModule } from 'modules/entity-core';

const { BaseRepository } = EntityCoreModule.getChildren();

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
