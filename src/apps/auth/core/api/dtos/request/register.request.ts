import Joi, { ObjectSchema } from 'joi';

export const RegisterRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
});
