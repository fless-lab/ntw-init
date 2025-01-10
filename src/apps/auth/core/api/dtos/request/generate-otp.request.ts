import Joi, { ObjectSchema } from 'joi';

export const GenerateOtpRequestSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
});
