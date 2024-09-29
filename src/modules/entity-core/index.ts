import { BaseModel, createBaseSchema } from './models';
import { BaseRepository } from './repositories';
import { BaseService } from './services';

export class EntityCoreModule {
  public static getChildren() {
    return {
      BaseService,
      BaseRepository,
      BaseModel,
      createBaseSchema,
    };
  }
}
