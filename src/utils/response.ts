import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
  errorDetails?: any;
}

export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errorDetails: any = null
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
