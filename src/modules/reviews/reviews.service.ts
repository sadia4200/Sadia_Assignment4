import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { Review } from "@prisma/client";

export const createReview = async (
  customerId: string,
  data: { bookingId: string; rating: number; comment: string }
): Promise<Review> => {
  const { bookingId, rating, comment } = data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  // Only the customer on that booking can review it
  if (booking.customerId !== customerId) {
    throw new AppError(403, "Forbidden: Only the booking customer can write a review");
  }

  // Only after booking is COMPLETED
  if (booking.status !== "COMPLETED") {
    throw new AppError(400, `Cannot review booking. Booking must be COMPLETED (current status: ${booking.status})`);
  }

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: { bookingId },
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this booking");
  }

  return await prisma.review.create({
    data: {
      customerId,
      technicianId: booking.technicianId,
      bookingId,
      rating,
      comment,
    },
  });
};
