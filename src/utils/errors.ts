export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorDetails: any;

  constructor(statusCode: number, message: string, errorDetails: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}
