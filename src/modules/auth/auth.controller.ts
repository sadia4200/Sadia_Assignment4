import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/errors";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized: User payload missing");
    }
    const user = await authService.getUserById(req.user.id);
    sendSuccess(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    next(error);
  }
};
