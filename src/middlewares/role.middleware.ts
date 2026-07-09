import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const authorizeRoles = (...roles: ("CUSTOMER" | "TECHNICIAN" | "ADMIN")[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized: Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden: Access denied"));
    }

    next();
  };
};
