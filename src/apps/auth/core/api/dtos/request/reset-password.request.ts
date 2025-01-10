import Joi, { ObjectSchema } from 'joi';

export const ResetPasswordRequestSchema: ObjectSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});
