import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/errors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req: Request, _res: Response, next: NextFunction): void => {
  const { name, email, password, role } = req.body;
  const errors: Record<string, string> = {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.name = "Name is required and must be a string";
  }

  if (!email || !emailRegex.test(email)) {
    errors.email = "A valid email address is required";
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.password = "Password is required and must be at least 6 characters long";
  }

  if (!role || (role !== "TENANT" && role !== "LANDLORD")) {
    errors.role = "Role is required and must be either TENANT or LANDLORD";
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError(400, "Validation Error", errors));
  }

  next();
};

export const validateLogin = (req: Request, _res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors: Record<string, string> = {};

  if (!email || !emailRegex.test(email)) {
    errors.email = "A valid email address is required";
  }

  if (!password || typeof password !== "string" || password.trim().length === 0) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError(400, "Validation Error", errors));
  }

  next();
};
