import Joi, { ObjectSchema } from 'joi';

export const RefreshTokenRequestSchema: ObjectSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
