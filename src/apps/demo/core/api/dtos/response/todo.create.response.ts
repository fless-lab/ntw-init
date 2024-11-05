import { TodoPriority } from 'apps/demo/core/domain';
import Joi from 'joi';

export const TodoResponseSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(50),
  slug: Joi.string().alphanum().min(3).max(15),
  description: Joi.string().alphanum().min(3).max(200),
  dueDate: Joi.date(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

export type TodoResponse = {
  name: string;
  slug: string;
  description: string;
  dueDate: string;
  priority: TodoPriority;
};
