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

export const createProperty = async (landlordId: string, data: any) => {
  const { categoryId, ...propertyDetails } = data;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(400, "Invalid Category: The specified category does not exist");
  }

  return await prisma.property.create({
    data: {
      ...propertyDetails,
      landlordId,
      categoryId,
    },
    include: {
      category: true,
    },
  });
};

export const updateProperty = async (propertyId: string, landlordId: string, updateData: any) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "Forbidden: You do not own this property");
  }

  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
    });
    if (!category) {
      throw new AppError(400, "Invalid Category: The specified category does not exist");
    }
  }

  return await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
    include: {
      category: true,
    },
  });
};

export const deleteProperty = async (propertyId: string, landlordId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "Forbidden: You do not own this property");
  }

  const activeRequestsCount = await prisma.rentalRequest.count({
    where: {
      propertyId,
      status: {
        in: ["PENDING", "APPROVED", "ACTIVE"],
      },
    },
  });

  if (activeRequestsCount > 0) {
    throw new AppError(
      400,
      "Cannot delete property: active, approved, or pending rental requests exist for this listing"
    );
  }

  return await prisma.property.delete({
    where: { id: propertyId },
  });
};

export const getPropertiesByLandlord = async (
  landlordId: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where: { landlordId },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.property.count({
      where: { landlordId },
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

