import { Request, Response, NextFunction } from "express";
import * as servicesService from "./services.service";
import { sendSuccess } from "../../utils/response";

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await servicesService.getServices(req.query as any);
    sendSuccess(res, 200, "Services retrieved successfully", services);
  } catch (error) {
    next(error);
  }
};
