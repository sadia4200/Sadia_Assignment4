import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request ID format"),
  }),
});

export const getPaymentsSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
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
