import { z } from "zod";

export const getUsersSchema = z.object({
  query: z.object({
    role: z.enum(["TENANT", "LANDLORD", "ADMIN"]).optional(),
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

export const getPropertiesSchema = z.object({
  query: z.object({
    availability: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
    landlordId: z.string().uuid("Invalid landlord ID format").optional(),
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

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
  }),
});
