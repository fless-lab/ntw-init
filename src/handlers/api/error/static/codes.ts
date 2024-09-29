import { ErrorCodes as ErrorCodesType } from '../types';

export const ErrorCodes: ErrorCodesType = {
  UNIQUE_FIELD_ERROR: {
    code: 'UNIQUE_FIELD_ERROR',
    message: 'A field that is supposed to be unique already exists.',
    statusCode: 409,
  },
  NOT_FOUND_ERROR: {
    code: 'NOT_FOUND_ERROR',
    message: 'The requested item could not be found.',
    statusCode: 404,
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'There was a problem accessing the database.',
    statusCode: 500,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed for one or more fields.',
    statusCode: 400,
  },
  GENERAL_ERROR: {
    code: 'GENERAL_ERROR',
    message: 'An unexpected error occurred.',
    statusCode: 500,
  },
  REQUIRED_FIELD_MISSING: {
    code: 'REQUIRED_FIELD_MISSING',
    message: 'Required field(s) missing.',
    statusCode: 400,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Required field(s) missing.',
    statusCode: 400,
  },
  FOUND: {
    code: 'FOUND',
    message: 'The requested item was found.',
    statusCode: 302,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized',
    statusCode: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Forbidden',
    statusCode: 403,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
    statusCode: 500,
  },
  MAIL_ERROR: {
    code: 'MAIL_ERROR',
    message: 'Failed to send email. Please try again later.',
    statusCode: 500,
  },
  METHOD_NOT_ALLOWED: {
    code: 'METHOD_NOT_ALLOWED',
    message: 'The requested method is not allowed for this resource.',
    statusCode: 405,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message:
      'The request could not be completed due to a conflict with the current state of the resource.',
    statusCode: 409,
  },
  UNSUPPORTED_MEDIA_TYPE: {
    code: 'UNSUPPORTED_MEDIA_TYPE',
    message:
      'The server does not support the media type transmitted in the request.',
    statusCode: 415,
  },
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'The server is currently unavailable. Please try again later.',
    statusCode: 503,
  },
  GATEWAY_TIMEOUT: {
    code: 'GATEWAY_TIMEOUT',
    message:
      'The server did not receive a timely response from an upstream server.',
    statusCode: 504,
  },
  PAYLOAD_TOO_LARGE: {
    code: 'PAYLOAD_TOO_LARGE',
    message: 'The request payload is too large.',
    statusCode: 413,
  },
  UNPROCESSABLE_ENTITY: {
    code: 'UNPROCESSABLE_ENTITY',
    message:
      'The request was well-formed but was unable to be followed due to semantic errors.',
    statusCode: 422,
  },
  PRECONDITION_FAILED: {
    code: 'PRECONDITION_FAILED',
    message:
      'The server does not meet one of the preconditions that the requester put on the request.',
    statusCode: 412,
  },
  NETWORK_AUTHENTICATION_REQUIRED: {
    code: 'NETWORK_AUTHENTICATION_REQUIRED',
    message: 'The client needs to authenticate to gain network access.',
    statusCode: 511,
  },
};
