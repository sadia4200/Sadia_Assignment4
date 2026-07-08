import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. AppError
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errorDetails);
    return;
  }

  // 2. ZodError (in case it bypasses validate middleware)
  if (err instanceof ZodError) {
    const errorDetails = err.issues.map((issue) => {
      const path = issue.path.join(".");
      const field = path.replace(/^(body|query|params)\./, "");
      return {
        field: field || path,
        message: issue.message,
      };
    });
    sendError(res, 400, "Validation Error", errorDetails);
    return;
  }

  // 3. Prisma Known Request Errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P2")) {
    if (err.code === "P2002") {
      const targets = err.meta?.target || [];
      const field = targets.join(", ");
      const message = field.includes("email")
        ? "Email already exists"
        : field.includes("transactionId")
        ? "Transaction ID already exists"
        : `Unique constraint failed on field: ${field}`;
      
      sendError(res, 409, message, { target: targets });
      return;
    }

    if (err.code === "P2025") {
      sendError(res, 404, "Record not found", null);
      return;
    }
  }

  // 4. JWT Errors
  if (err.name === "JsonWebTokenError") {
    sendError(res, 401, "Unauthorized: Invalid token", null);
    return;
  }
  if (err.name === "TokenExpiredError") {
    sendError(res, 401, "Unauthorized: Token has expired", null);
    return;
  }

  // 5. Unhandled / Unexpected Errors
  // We NEVER leak stack traces or internal implementation details in the response body.
  console.error("Unhandled Error:", err);
  const message = "Something went wrong on the server";
  sendError(res, 500, message, null);
};
