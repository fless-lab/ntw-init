import { Document, Types } from 'mongoose';
import { IBaseModel } from '../../../types';

export type TodoPriority = 'low' | 'medium' | 'high';

export interface ITodo {
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: TodoPriority;
  user: Types.ObjectId;
}

export interface ITodoModel extends ITodo, IBaseModel, Document {}
