export enum EmailTemplate {
  ACCOUNT_CREATION = 'account-creation',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  OTP = 'otp',
  WELCOME = 'welcome',
}

export interface ITemplateConfig {
  path: string;
  requiredData: string[];
  description: string;
}

export const templateConfigs: Record<EmailTemplate, ITemplateConfig> = {
  [EmailTemplate.ACCOUNT_CREATION]: {
    path: 'account-creation',
    requiredData: ['name', 'email', 'verificationUrl'],
    description: 'Email sent when a new account is created',
  },
  [EmailTemplate.PASSWORD_RESET]: {
    path: 'password-reset',
    requiredData: ['name', 'resetUrl', 'expiresIn'],
    description: 'Email sent for password reset requests',
  },
  [EmailTemplate.EMAIL_VERIFICATION]: {
    path: 'email-verification',
    requiredData: ['name', 'verificationUrl', 'expiresIn'],
    description: 'Email sent to verify email address',
  },
  [EmailTemplate.OTP]: {
    path: 'otp',
    requiredData: ['code', 'purpose', 'expiresIn'],
    description: 'Email sent with OTP code',
  },
  [EmailTemplate.WELCOME]: {
    path: 'welcome',
    requiredData: ['name'],
    description: 'Welcome email sent after account verification',
  },
};
