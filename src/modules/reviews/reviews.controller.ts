import { Request, Response, NextFunction } from "express";
import * as reviewsService from "./reviews.service";
import { sendSuccess } from "../../utils/response";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user!.id;
    const result = await reviewsService.createReview(tenantId, req.body);
    sendSuccess(res, 201, "Review submitted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getPropertyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const filters = req.query as any;
    const result = await reviewsService.getPropertyReviews(id as string, filters);
    sendSuccess(res, 200, "Property reviews retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
