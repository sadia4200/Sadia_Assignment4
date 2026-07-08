import { z } from "zod";

export const getPropertiesSchema = z.object({
  query: z.object({
    location: z.string().optional(),
    minPrice: z.preprocess(
      (val) => (val ? parseFloat(val as string) : undefined),
      z.number().min(0, "minPrice must be a non-negative number").optional()
    ),
    maxPrice: z.preprocess(
      (val) => (val ? parseFloat(val as string) : undefined),
      z.number().min(0, "maxPrice must be a non-negative number").optional()
    ),
    propertyType: z.string().optional(),
    categoryId: z.string().optional(),
    amenities: z.string().optional(),
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
