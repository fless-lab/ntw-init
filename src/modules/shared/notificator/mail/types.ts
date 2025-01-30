import { EmailTemplate } from './templates';

export interface IEmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface IEmailRecipient {
  email: string;
  name?: string;
}

export interface IEmailOptions {
  to: string | IEmailRecipient | Array<string | IEmailRecipient>;
  template: EmailTemplate;
  data: Record<string, any>;
  attachments?: IEmailAttachment[];
  cc?: string | IEmailRecipient | Array<string | IEmailRecipient>;
  bcc?: string | IEmailRecipient | Array<string | IEmailRecipient>;
  replyTo?: string | IEmailRecipient;
}

export interface IEmailResponse {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export interface ITemplateData extends Record<string, any> {
  subject: string;
}

export interface IEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export class EmailError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = true,
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export enum EmailErrorCode {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_RENDERING_ERROR = 'TEMPLATE_RENDERING_ERROR',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ATTACHMENT = 'INVALID_ATTACHMENT',
}
