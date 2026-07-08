import { Request, Response, NextFunction } from "express";
import * as propertiesService from "./properties.service";
import { sendSuccess } from "../../utils/response";

export const getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await propertiesService.queryProperties(filters);
    sendSuccess(res, 200, "Properties retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await propertiesService.getPropertyById(id as string);
    sendSuccess(res, 200, "Property details retrieved successfully", property);
  } catch (error) {
    next(error);
  }
};
