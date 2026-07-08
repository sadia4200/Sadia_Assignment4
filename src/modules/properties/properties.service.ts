import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { Property, PropertyAvailability } from "@prisma/client";

export interface PropertiesFilterQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  categoryId?: string;
  amenities?: string;
  page: number;
  limit: number;
}

export const queryProperties = async (filters: PropertiesFilterQuery) => {
  const { location, minPrice, maxPrice, propertyType, categoryId, amenities, page, limit } = filters;

  const whereClause: any = {
    availability: "AVAILABLE" as PropertyAvailability,
  };

  if (location) {
    whereClause.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) {
      whereClause.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      whereClause.price.lte = maxPrice;
    }
  }

  if (propertyType) {
    whereClause.propertyType = {
      equals: propertyType,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (amenities) {
    const amenitiesList = amenities.split(",").map((a) => a.trim()).filter(Boolean);
    if (amenitiesList.length > 0) {
      whereClause.amenities = {
        hasSome: amenitiesList,
      };
    }
  }

  const skip = (page - 1) * limit;

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where: whereClause,
      include: {
        category: true,
        landlord: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.property.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    properties,
  };
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!property || property.availability !== "AVAILABLE") {
    throw new AppError(404, "Property not found or is no longer available");
  }

  return property;
};
