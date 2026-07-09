import { z } from "zod";

export const getUsersSchema = z.object({
  query: z.object({
    role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BANNED"]).optional(),
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

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "BANNED"], {
      message: "Status must be either ACTIVE or BANNED",
    }),
  }),
});

export const getBookingsSchema = z.object({
  query: z.object({
    status: z.enum(["REQUESTED", "ACCEPTED", "DECLINED", "PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
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

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Category name is required"),
  }),
});
