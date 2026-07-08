import { z } from "zod";

export const createRentalSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid("Invalid property ID format"),
    startDate: z.string().datetime("Invalid startDate format. Must be an ISO date string"),
    duration: z.number().int().positive("Duration must be a positive integer"),
  }),
});

export const getRentalsSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"]).optional(),
    page: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z.number().int().positive("page must be a positive integer").default(1)
    ),
    limit: z.preprocess(
      (val) => (val ? parseInt(val as string, 10) : undefined),
      z.number().int().positive("limit must be a positive integer").default(10)
    ),
  }),
});

export const landlordActionSchema = z.object({
  body: z.object({
    action: z.enum(["APPROVE", "REJECT"], {
      message: "action is required and must be either APPROVE or REJECT",
    }),
  }),
});
