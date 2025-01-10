import { Request, Response } from 'express';
import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
import { sanitize } from 'helpers';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  VerifyAccountRequestSchema,
  GenerateOtpRequestSchema,
  LoginOtpRequestSchema,
  RefreshTokenRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '../dtos/request';
import { AuthService } from 'modules/authz/authentication/services';

class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, RegisterRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.register(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Verify user account with OTP
   */
  static async verifyAccount(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, VerifyAccountRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.verifyAccount(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Login with password
   */
  static async loginWithPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, LoginRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.loginWithPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Generate OTP for login
   */
  static async generateLoginOtp(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, GenerateOtpRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.generateLoginOtp(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Login with OTP
   */
  static async loginWithOtp(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, LoginOtpRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.loginWithOtp(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, RefreshTokenRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.refresh(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    try {
      const response = await AuthService.logout(req.body);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, ForgotPasswordRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.forgotPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, ResetPasswordRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.resetPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }
}

export default AuthController;
