import Joi, { ObjectSchema } from 'joi';

export const ForgotPasswordRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
});
