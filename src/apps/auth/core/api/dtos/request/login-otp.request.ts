import Joi, { ObjectSchema } from 'joi';

export const LoginOtpRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
});
