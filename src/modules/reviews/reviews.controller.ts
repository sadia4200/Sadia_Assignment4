import { Request, Response, NextFunction } from "express";
import * as reviewsService from "./reviews.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/errors";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const customerId = req.user.id;
    const result = await reviewsService.createReview(customerId, req.body);
    sendSuccess(res, 201, "Review submitted successfully", result);
  } catch (error) {
    next(error);
  }
};
