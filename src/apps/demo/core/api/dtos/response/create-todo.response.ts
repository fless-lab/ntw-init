import Joi, { ObjectSchema } from 'joi';

export const CreateTodoResponseSchema: ObjectSchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  completed: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
