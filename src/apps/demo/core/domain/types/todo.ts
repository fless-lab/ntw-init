import { IBaseModel } from '@nodesandbox/repo-framework';
import { Document, Types } from 'mongoose';

export type TodoPriority = 'low' | 'medium' | 'high';

export interface ITodo {
  title: string;
  description?: string;
  image: string;
  completed: boolean;
  dueDate?: Date;
  priority: TodoPriority;
  user: Types.ObjectId;
}

export interface ITodoModel extends ITodo, IBaseModel, Document {}
