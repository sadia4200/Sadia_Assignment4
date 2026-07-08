import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";
import config from "../config";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errorDetails);
    return;
  }

  // Handle default server errors
  const message = err.message || "Internal Server Error";
  const errorDetails = config.env === "development" ? { stack: err.stack, ...err } : null;
  sendError(res, 500, message, errorDetails);
};
