import { Request, Response, NextFunction } from "express";
import * as bookingsService from "./bookings.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/errors";

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const booking = await bookingsService.createBooking(req.user.id, req.body);
    sendSuccess(res, 201, "Booking requested successfully", booking);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    // Customer's own bookings
    const bookings = await bookingsService.getCustomerBookings(req.user.id);
    sendSuccess(res, 200, "Bookings retrieved successfully", bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }
    const booking = await bookingsService.getBookingById(req.params.id as string, req.user.id, req.user.role);
    sendSuccess(res, 200, "Booking details retrieved successfully", booking);
  } catch (error) {
    next(error);
  }
};
