import Joi, { ObjectSchema } from 'joi';

export const ValidateOTPRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  purpose: Joi.string().required(),
});
