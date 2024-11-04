import Joi, { ObjectSchema } from 'joi';

export const CreateTodoRequestSchema: ObjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});
