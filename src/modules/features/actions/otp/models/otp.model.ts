import { BaseModel, createBaseSchema } from '@nodesandbox/repo-framework';
import { IOTPModel } from '../types';
import { Schema } from 'mongoose';

const OTP_MODEL_NAME = 'OTP';

const otpSchema = createBaseSchema<IOTPModel>(
  {
    code: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    isFresh: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.keys(CONFIG.otp.purposes),
      required: true,
    },
  },
  {
    modelName: OTP_MODEL_NAME,
  },
);

const OTPModel = new BaseModel<IOTPModel>(OTP_MODEL_NAME, otpSchema).getModel();

export { OTPModel };
