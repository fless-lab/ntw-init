import { Model } from 'mongoose';
import { BaseRepository } from '@nodesandbox/repo-framework';
import { IOTPModel, TOTPPurpose } from '../types';
import { generateRandomCode } from 'helpers';

export class OTPRepository extends BaseRepository<IOTPModel> {
  constructor(model: Model<IOTPModel>) {
    super(model);
  }

  async generateCode(
    user: string | any, // TODO: Replace this later with a proper type (string | ObjectId)
    purpose: TOTPPurpose,
  ): Promise<IOTPModel> {
    await this.invalidateOldCodes(user, purpose);
    const payload = {
      code: generateRandomCode(CONFIG.otp.length),
      expiresAt: new Date(Date.now() + CONFIG.otp.expiration),
      user,
      purpose,
    };
    return this.create(payload);
  }

  async markAsUsed(otpId: string): Promise<IOTPModel | null> {
    const payload = { used: true };
    return this.update({ _id: otpId }, payload);
  }

  async isValid(code: string): Promise<boolean> {
    const otp = await this.findOne({ code, isFresh: true, used: false });
    return otp ? Date.now() <= otp.expiresAt.getTime() : false;
  }

  async findValidCodeByUser(
    code: string,
    user: string,
    purpose: TOTPPurpose,
  ): Promise<IOTPModel | null> {
    return await this.findOne({
      code,
      user,
      isFresh: true,
      used: false,
      purpose,
    });
  }

  async invalidateOldCodes(user: string, purpose: TOTPPurpose): Promise<void> {
    /* TODO: Create a updateMany method or adapt the current update to be able to use it 
    here instead of calling the model */
    await this.model
      .updateMany({ user, used: false, purpose }, { $set: { isFresh: false } })
      .exec();
  }
}
