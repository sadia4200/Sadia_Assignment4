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

export const createLandlordProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const result = await propertiesService.createProperty(landlordId, req.body);
    sendSuccess(res, 201, "Property created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateLandlordProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const { id } = req.params;
    const result = await propertiesService.updateProperty(id as string, landlordId, req.body);
    sendSuccess(res, 200, "Property updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const deleteLandlordProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const { id } = req.params;
    await propertiesService.deleteProperty(id as string, landlordId);
    sendSuccess(res, 200, "Property deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

export const getLandlordProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const { page, limit } = req.query as any;
    const result = await propertiesService.getPropertiesByLandlord(landlordId, page, limit);
    sendSuccess(res, 200, "Landlord properties retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

