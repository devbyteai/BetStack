import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticate.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  SendOtpInput,
  VerifyOtpInput,
  ResetPasswordInput,
} from './auth.schema.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      if (!user) {
        return sendSuccess(res, { success: true });
      }
      const result = await authService.logout(user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await authService.refreshToken(refreshToken);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as SendOtpInput;
      const result = await authService.sendOtp(input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as VerifyOtpInput;
      const result = await authService.verifyOtp(input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as ResetPasswordInput;
      const result = await authService.resetPassword(input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
