import Joi, { ObjectSchema } from 'joi';

export const CreateFileRequestSchema: ObjectSchema = Joi.object({
  file: Joi.binary().required(),
});
