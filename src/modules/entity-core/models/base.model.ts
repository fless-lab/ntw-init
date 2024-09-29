import { Schema, model as mongooseModel, Model } from 'mongoose';
import PluginManager from './plugins';
import { IBaseModel } from '../../../types';

function createBaseSchema<T extends IBaseModel>(
  definition: Record<string, any>,
  options: {
    excludePlugins?: string[];
    includePlugins?: [(schema: Schema, options?: any) => void, object?][];
    modelName?: string;
  } = {},
): Schema<T> {
  const baseSchema = new Schema<T>(
    {
      ...definition,
      deletedAt: { type: Date, default: null },
      deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      __version__: { type: Number, default: 0 },
    },
    { timestamps: true },
  );

  PluginManager.applyPlugins(baseSchema, {
    exclude: options.excludePlugins,
    include: options.includePlugins,
    modelName: options.modelName,
  });

  return baseSchema;
}

class BaseModel<T extends IBaseModel> {
  private model: Model<T>;

  constructor(modelName: string, schema: Schema<T>) {
    this.model = mongooseModel<T>(modelName, schema);
  }

  getModel() {
    return this.model;
  }
}

export { createBaseSchema, IBaseModel, BaseModel };
