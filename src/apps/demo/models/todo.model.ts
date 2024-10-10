// import { AppModule } from '../../../modules';
// TODO: Use AppModule instead of direct BaseRepository import
import {
  BaseModel,
  createBaseSchema,
} from '../../../modules/entity-core/models';
import { ITodoModel } from '../types';

const TODO_MODEL_NAME = 'Todo';
// const { BaseModel, createBaseSchema } = AppModule.fromEntityCoreModule();

const todoSchema = createBaseSchema<ITodoModel>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    modelName: TODO_MODEL_NAME,
  },
);

const TodoModel = new BaseModel<ITodoModel>(
  TODO_MODEL_NAME,
  todoSchema,
).getModel();

export { TodoModel };
