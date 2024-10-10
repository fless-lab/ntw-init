import { Model } from 'mongoose';
import { ITodoModel } from '../types';
// import { AppModule } from '../../../modules';
// TODO: Use AppModule instead of direct BaseRepository import
import { BaseRepository } from '../../../modules/entity-core/repositories';

// const { BaseRepository } = AppModule.fromEntityCoreModule();

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
