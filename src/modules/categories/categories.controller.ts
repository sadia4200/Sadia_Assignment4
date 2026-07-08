import { Request, Response, NextFunction } from "express";
import * as categoriesService from "./categories.service";
import { sendSuccess } from "../../utils/response";

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoriesService.getAllCategories();
    sendSuccess(res, 200, "Categories retrieved successfully", categories);
  } catch (error) {
    next(error);
  }
};
