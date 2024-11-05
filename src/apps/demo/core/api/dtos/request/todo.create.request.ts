import { TodoPriority } from 'apps/demo/core/domain';
import Joi from 'joi';

export const TodoRequestSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(50).required(),
  slug: Joi.string().alphanum().min(3).max(15).required(),
  description: Joi.string().alphanum().min(3).max(200),
  dueDate: Joi.date(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

export type TodoRequest = {
  name: string;
  slug: string;
  description: string;
  dueDate: Date;
  priority: TodoPriority;
};
