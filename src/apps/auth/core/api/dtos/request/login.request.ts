import Joi, { ObjectSchema } from 'joi';

export const LoginRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
