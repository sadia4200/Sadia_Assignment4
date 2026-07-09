import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { BookingStatus } from "@prisma/client";

export const createBooking = async (customerId: string, data: { serviceId: string; scheduledAt: string }) => {
  const { serviceId, scheduledAt } = data;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  // Create booking in REQUESTED status
  const booking = await prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      status: "REQUESTED",
    },
    include: {
      service: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return booking;
};

export const getCustomerBookings = async (customerId: string) => {
  return await prisma.booking.findMany({
    where: { customerId },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      payments: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTechnicianBookings = async (technicianId: string) => {
  return await prisma.booking.findMany({
    where: { technicianId },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      payments: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getBookingById = async (bookingId: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      payments: true,
      reviews: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  // Access Control
  if (role !== "ADMIN" && booking.customerId !== userId && booking.technicianId !== userId) {
    throw new AppError(403, "Forbidden: Access denied to this booking details");
  }

  return booking;
};

export const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  role: string,
  newStatus: BookingStatus
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  const currentStatus = booking.status;

  // 1. CANCELLED: Customer can cancel anytime before IN_PROGRESS
  if (newStatus === "CANCELLED") {
    if (role !== "ADMIN" && booking.customerId !== userId) {
      throw new AppError(403, "Forbidden: Only the booking customer can cancel it");
    }
    const cancellableStatuses: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];
    if (!cancellableStatuses.includes(currentStatus)) {
      throw new AppError(400, `Cannot cancel booking. Current status is ${currentStatus}`);
    }
  }

  // 2. ACCEPTED/DECLINED: Technician can accept/decline REQUESTED bookings
  else if (newStatus === "ACCEPTED" || newStatus === "DECLINED") {
    if (role !== "ADMIN" && booking.technicianId !== userId) {
      throw new AppError(403, "Forbidden: Only the technician assigned can accept or decline");
    }
    if (currentStatus !== "REQUESTED") {
      throw new AppError(400, `Cannot update to ${newStatus}. Current status is ${currentStatus} (expected: REQUESTED)`);
    }
  }

  // 3. IN_PROGRESS: Technician starts booking, after it is PAID
  else if (newStatus === "IN_PROGRESS") {
    if (role !== "ADMIN" && booking.technicianId !== userId) {
      throw new AppError(403, "Forbidden: Only the assigned technician can start the service");
    }
    if (currentStatus !== "PAID") {
      throw new AppError(400, `Cannot start service. Current status must be PAID (current: ${currentStatus})`);
    }
  }

  // 4. COMPLETED: Technician completes the service from IN_PROGRESS
  else if (newStatus === "COMPLETED") {
    if (role !== "ADMIN" && booking.technicianId !== userId) {
      throw new AppError(403, "Forbidden: Only the assigned technician can mark it completed");
    }
    if (currentStatus !== "IN_PROGRESS") {
      throw new AppError(400, `Cannot complete booking. Current status is ${currentStatus} (expected: IN_PROGRESS)`);
    }
  }

  // If status transitions are not met
  else {
    throw new AppError(400, `Invalid target status update: ${newStatus}`);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
    include: {
      service: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedBooking;
};
