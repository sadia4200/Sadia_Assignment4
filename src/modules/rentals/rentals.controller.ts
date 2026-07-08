import { Request, Response, NextFunction } from "express";
import * as rentalsService from "./rentals.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/errors";

export const createRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user!.id;
    const result = await rentalsService.createRentalRequest(tenantId, req.body);
    sendSuccess(res, 201, "Rental request submitted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const filters = req.query as any;

    if (role === "TENANT") {
      const result = await rentalsService.getTenantRentals(userId, filters);
      return sendSuccess(res, 200, "Tenant rental requests retrieved successfully", result);
    }

    if (role === "LANDLORD") {
      const result = await rentalsService.getLandlordRentals(userId, filters);
      return sendSuccess(res, 200, "Landlord rental requests retrieved successfully", result);
    }

    if (role === "ADMIN") {
      throw new AppError(
        403,
        "Forbidden: Admins must query requests through the dedicated admin endpoints"
      );
    }

    throw new AppError(403, "Forbidden: Access denied");
  } catch (error) {
    next(error);
  }
};

export const getRequestDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await rentalsService.getRentalRequestById(id as string, userId);
    sendSuccess(res, 200, "Rental request details retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const processRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const { id } = req.params;
    const { action } = req.body;
    const result = await rentalsService.processRentalRequest(id as string, landlordId, action);
    sendSuccess(
      res,
      200,
      `Rental request successfully ${action === "APPROVE" ? "approved" : "rejected"}`,
      result
    );
  } catch (error) {
    next(error);
  }
};

export const getLandlordRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const landlordId = req.user!.id;
    const filters = req.query as any;
    const result = await rentalsService.getLandlordRentals(landlordId, filters);
    sendSuccess(res, 200, "Landlord properties rental requests retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
