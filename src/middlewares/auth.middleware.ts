import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { AppError } from "../utils/errors";

export interface DecodedUser {
  id: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
}

// Extend Express Request globally in this compilation scope
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export const auth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized: Token missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError(401, "Unauthorized: Token has expired"));
    }
    next(new AppError(401, "Unauthorized: Invalid token"));
  }
};
