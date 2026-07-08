import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request ID format"),
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().min(1, "Comment is required"),
  }),
});

export const getPropertyReviewsSchema = z.object({
  query: z.object({
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
