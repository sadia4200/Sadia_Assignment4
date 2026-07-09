import { z } from "zod";

export const getServicesQuerySchema = z.object({
  query: z.object({
    type: z.string().optional(),
    location: z.string().optional(),
    rating: z.string().optional(),
    price: z.string().optional(),
  }),
});
