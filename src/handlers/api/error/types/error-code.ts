export interface ErrorCode {
  code: string;
  message: string;
  statusCode: number;
}

export interface ErrorCodes {
  [key: string]: ErrorCode;
}
