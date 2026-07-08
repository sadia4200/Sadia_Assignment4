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

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    location: z.string().trim().min(1, "Location is required"),
    price: z.number().positive("Price must be a positive number"),
    propertyType: z.string().trim().min(1, "Property type is required"),
    categoryId: z.string().trim().min(1, "Category ID is required"),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    availability: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    description: z.string().trim().min(1, "Description cannot be empty").optional(),
    location: z.string().trim().min(1, "Location cannot be empty").optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    propertyType: z.string().trim().min(1, "Property type cannot be empty").optional(),
    categoryId: z.string().trim().min(1, "Category ID cannot be empty").optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    availability: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
  }),
});

export const getLandlordPropertiesSchema = z.object({
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
