import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { RentalRequest, RentalStatus } from "@prisma/client";

export interface RentalsQueryFilters {
  status?: RentalStatus;
  page: number;
  limit: number;
}

export const createRentalRequest = async (
  tenantId: string,
  data: { propertyId: string; startDate: string; duration: number }
): Promise<RentalRequest> => {
  const { propertyId, startDate, duration } = data;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.availability !== "AVAILABLE") {
    throw new AppError(400, "Property is not available for rent");
  }

  const existingPending = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: "PENDING",
    },
  });

  if (existingPending) {
    throw new AppError(409, "You already have a pending rental request for this property");
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj.getTime() + duration * 24 * 60 * 60 * 1000);

  return await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      startDate: startDateObj,
      endDate: endDateObj,
      duration,
      status: "PENDING",
    },
    include: {
      property: true,
    },
  });
};

export const getTenantRentals = async (tenantId: string, filters: RentalsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = { tenantId };
  if (status) {
    whereClause.status = status;
  }

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.rentalRequest.count({
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
    rentals,
  };
};

export const getLandlordRentals = async (landlordId: string, filters: RentalsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    property: {
      landlordId,
    },
  };
  if (status) {
    whereClause.status = status;
  }

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            category: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.rentalRequest.count({
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
    rentals,
  };
};

export const getRentalRequestById = async (requestId: string, userId: string): Promise<any> => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: {
      property: {
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental request not found");
  }

  // Check access: only tenant who requested or property landlord
  if (rental.tenantId !== userId && rental.property.landlordId !== userId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  return rental;
};

export const processRentalRequest = async (
  requestId: string,
  landlordId: string,
  action: "APPROVE" | "REJECT"
): Promise<RentalRequest> => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: {
      property: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental request not found");
  }

  if (rental.property.landlordId !== landlordId) {
    throw new AppError(403, "Forbidden: You do not own this property");
  }

  if (rental.status !== "PENDING") {
    throw new AppError(400, "This request has already been processed");
  }

  const nextStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

  return await prisma.rentalRequest.update({
    where: { id: requestId },
    data: {
      status: nextStatus as RentalStatus,
    },
    include: {
      property: true,
    },
  });
};
