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

export const getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await adminService.getProperties(filters);
    sendSuccess(res, 200, "Properties retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await adminService.getRentals(filters);
    sendSuccess(res, 200, "Rental requests retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await adminService.getPayments(filters);
    sendSuccess(res, 200, "Payments retrieved successfully", result);
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

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await adminService.updateCategory(id as string, req.body);
    sendSuccess(res, 200, "Category updated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteCategory(id as string);
    sendSuccess(res, 200, "Category deleted successfully", result);
  } catch (error) {
    next(error);
  }
};
