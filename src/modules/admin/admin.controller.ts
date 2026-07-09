import { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";
import { sendSuccess } from "../../utils/response";

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await adminService.getUsers(filters);
    sendSuccess(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;
    const result = await adminService.updateUserStatus(adminId, id as string, status);
    sendSuccess(res, 200, "User status updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await adminService.getBookings(filters);
    sendSuccess(res, 200, "Bookings retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.getCategories();
    sendSuccess(res, 200, "Categories retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.createCategory(req.body);
    sendSuccess(res, 201, "Category created successfully", result);
  } catch (error) {
    next(error);
  }
};
