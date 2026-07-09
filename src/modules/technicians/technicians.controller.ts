import { Request, Response, NextFunction } from "express";
import * as techniciansService from "./technicians.service";
import * as bookingsService from "../bookings/bookings.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/errors";

// --- Public Endpoints ---
export const getTechnicians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const technicians = await techniciansService.getTechnicians(req.query as any);
    sendSuccess(res, 200, "Technicians retrieved successfully", technicians);
  } catch (error) {
    next(error);
  }
};

export const getTechnicianById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const technician = await techniciansService.getTechnicianById(req.params.id as string);
    sendSuccess(res, 200, "Technician details retrieved successfully", technician);
  } catch (error) {
    next(error);
  }
};

// --- Private Technician Endpoints ---
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const profile = await techniciansService.updateProfile(req.user.id, req.body);
    sendSuccess(res, 200, "Profile updated successfully", profile);
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const profile = await techniciansService.updateAvailability(req.user.id, req.body.isAvailable);
    sendSuccess(res, 200, "Availability status updated successfully", profile);
  } catch (error) {
    next(error);
  }
};

export const getTechnicianBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const bookings = await bookingsService.getTechnicianBookings(req.user.id);
    sendSuccess(res, 200, "Technician bookings retrieved successfully", bookings);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const booking = await bookingsService.updateBookingStatus(
      req.params.id as string,
      req.user.id,
      req.user.role,
      req.body.status
    );
    sendSuccess(res, 200, `Booking status updated to ${req.body.status} successfully`, booking);
  } catch (error) {
    next(error);
  }
};
