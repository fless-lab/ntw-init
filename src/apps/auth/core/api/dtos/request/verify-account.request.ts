import Joi, { ObjectSchema } from 'joi';

export const VerifyAccountRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
});
