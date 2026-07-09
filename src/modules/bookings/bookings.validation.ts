import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid("Invalid service ID format"),
    scheduledAt: z.string().datetime({ message: "Invalid ISO datetime format for scheduledAt" }),
  }),
});

export const getBookingByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid booking ID format"),
  }),
});
