import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { PasswordUtils } from 'helpers';
import { UserModel } from '../models';
import { UserRepository } from '../repositories';
import { IUserModel } from '../types';

class UserService extends BaseService<IUserModel, UserRepository> {
  constructor() {
    const userRepo = new UserRepository(UserModel);

    super(userRepo, {
      filter: {
        allowedFields: ['verified', 'active'],
        defaultSort: { createdAt: -1 },
      },
      search: {
        enabled: true,
        fields: ['firstname', 'lastname', 'email', 'phone'],
        caseSensitive: false,
        fuzzySearch: false,
      },
      populate: {
        fields: [],
        defaultPopulate: false,
      },
    });
  }

  async isvalidPassword(
    userId: string,
    password: string,
  ): Promise<SuccessResponseType<{ valid: boolean }> | ErrorResponseType> {
    try {
      const response = await this.findById(userId);

      if (!response.success || !response.data) {
        LOGGER.error('Error password check', response);
        throw response.error;
      }

      const user = response.data.docs as unknown as IUserModel;
      const valid = await PasswordUtils.comparePassword(
        password,
        user.password,
      );

      return { success: true, data: { valid } };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL SERVER ERROR',
                message: (error as Error).message,
              }),
      };
    }
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = await this.findById(userId);

      if (!response.success || !response.data) {
        LOGGER.error('Error password update', response);
        throw response.error;
      }

      const hashedPassword = await PasswordUtils.hashPassword(newPassword);

      const updateResponse = await this.updateById(userId, {
        password: hashedPassword,
      });

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      return updateResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL SERVER ERROR',
                message: (error as Error).message,
              }),
      };
    }
  }

  async isVerified(
    email: string,
  ): Promise<SuccessResponseType<{ verified: boolean }> | ErrorResponseType> {
    try {
      const response = await this.findOne({ email });

      if (!response.success || !response.data) {
        throw response.error;
      }

      const user = response.data.docs as unknown as IUserModel;

      return {
        success: true,
        data: { verified: user.verified },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERVAL_SERVER_ERROR',
                message: (error as Error).message,
              }),
      };
    }
  }

  async markAsVerified(
    email: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const response = await this.findOne({ email });

      if (!response.success || !response.data) {
        throw response.error;
      }

      const user = response.data.docs as unknown as IUserModel;

      const updateResponse = await this.updateById(user.id, { verified: true });

      if (!updateResponse.success) {
        throw updateResponse.error;
      }

      return updateResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'UNKNOWN_ERROR',
                message: (error as Error).message,
              }),
      };
    }
  }
}

export default new UserService();
