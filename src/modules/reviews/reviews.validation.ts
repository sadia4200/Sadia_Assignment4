import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID format"),
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().trim().min(1, "Comment is required"),
  }),
});
