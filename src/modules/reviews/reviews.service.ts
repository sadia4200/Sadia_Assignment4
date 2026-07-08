import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { Review } from "@prisma/client";

export const createReview = async (
  tenantId: string,
  data: { rentalRequestId: string; rating: number; comment: string }
): Promise<Review> => {
  const { rentalRequestId, rating, comment } = data;

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  if (rentalRequest.status !== "COMPLETED" && rentalRequest.status !== "ACTIVE") {
    throw new AppError(400, "You can only review a completed or active rental");
  }

  const existingReview = await prisma.review.findUnique({
    where: { rentalRequestId },
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this rental request");
  }

  return await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId,
      rating,
      comment,
    },
  });
};

export const getPropertyReviews = async (
  propertyId: string,
  filters: { page: number; limit: number }
) => {
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { propertyId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        tenant: {
          select: {
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
    prisma.review.count({
      where: { propertyId },
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
    reviews,
  };
};
