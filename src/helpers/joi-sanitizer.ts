import { ErrorResponse } from '@nodesandbox/response-kit';
import { ObjectSchema, ValidationError } from 'joi';

export const sanitize = <T>(
  data: Record<string, any>,
  schema: ObjectSchema<T>,
): T => {
  const { error, value } = schema.validate(data, { abortEarly: false }) as {
    error: ValidationError | undefined;
    value: Partial<T>;
  };

  if (error) {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    throw new ErrorResponse('VALIDATION_ERROR', message);
  }

  const sanitizedData = Object.keys(schema.describe().keys).reduce(
    (acc, key) => {
      const val = value[key as keyof T];
      if (val !== undefined) {
        acc[key as keyof T] = val;
      }
      return acc;
    },
    {} as T,
  );

  return sanitizedData;
};
