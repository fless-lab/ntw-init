import { BaseService } from '@nodesandbox/repo-framework';
import { IUserModel } from '../types';
import { UserRepository } from '../repositories';
import { UserModel } from '../models';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { PasswordUtils } from 'helpers';

class UserService extends BaseService<IUserModel, UserRepository> {
  constructor() {
    const userRepo = new UserRepository(UserModel);
    super(userRepo, false);

    this.allowedFilterFields = ['verified', 'active'];
    this.searchFields = ['firstname', 'lastname', 'email', 'phone'];
  }

  async isvalidPassword(
    userId: string,
    password: string,
  ): Promise<SuccessResponseType<{ isValid: boolean }> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        _id: userId,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        LOGGER.error('Error password check', response);
        throw response.error;
      }

      const userPassword = response.document.password;
      const isValid = await PasswordUtils.comparePassword(
        password,
        userPassword,
      );

      return { success: true, document: { isValid } };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL SERVER ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        _id: userId,
      })) as SuccessResponseType<IUserModel>;

      if (!response.success || !response.document) {
        LOGGER.error('Error password update', response);
        throw response.error;
      }

      const hashedPassword = await PasswordUtils.hashPassword(newPassword);

      const updateResponse = (await this.update(
        { _id: userId },
        { password: hashedPassword },
      )) as SuccessResponseType<IUserModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      return {
        success: true,
        document: updateResponse.document,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL SERVER ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async isVerified(
    email: string,
  ): Promise<SuccessResponseType<{ verified: boolean }> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;
      if (!response.success || !response.document) {
        throw response.error;
      }

      return {
        success: true,
        document: { verified: response.document.verified },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERVAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async markAsVerified(
    email: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = (await this.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;
      if (!response.success || !response.document) {
        throw response.error;
      }

      const updateResponse = (await this.update(
        { _id: response.document._id },
        { verified: true },
      )) as SuccessResponseType<IUserModel>;

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      return {
        success: true,
        document: updateResponse.document,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }
}

export default new UserService();
