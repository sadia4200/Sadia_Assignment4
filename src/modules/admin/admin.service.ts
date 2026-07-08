import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { User, Property, RentalRequest, Payment, Category, UserStatus, PropertyAvailability, RentalStatus, PaymentStatus } from "@prisma/client";

export const getUsers = async (filters: {
  role?: "TENANT" | "LANDLORD" | "ADMIN";
  status?: UserStatus;
  page: number;
  limit: number;
}) => {
  const { role, status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (role) whereClause.role = role;
  if (status) whereClause.status = status;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    users,
  };
};

export const updateUserStatus = async (
  adminId: string,
  targetUserId: string,
  status: UserStatus
): Promise<User> => {
  if (adminId === targetUserId) {
    throw new AppError(400, "Admins cannot ban themselves");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  return await prisma.user.update({
    where: { id: targetUserId },
    data: { status },
  });
};

export const getProperties = async (filters: {
  availability?: PropertyAvailability;
  landlordId?: string;
  page: number;
  limit: number;
}) => {
  const { availability, landlordId, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (availability) whereClause.availability = availability;
  if (landlordId) whereClause.landlordId = landlordId;

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where: whereClause,
      include: {
        category: true,
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where: whereClause }),
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

export const getRentals = async (filters: {
  status?: RentalStatus;
  page: number;
  limit: number;
}) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (status) whereClause.status = status;

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
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rentalRequest.count({ where: whereClause }),
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

export const getPayments = async (filters: {
  status?: PaymentStatus;
  page: number;
  limit: number;
}) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (status) whereClause.status = status;

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        rentalRequest: {
          include: {
            property: true,
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    payments,
  };
};

export const createCategory = async (data: { name: string; description?: string }): Promise<Category> => {
  const { name, description } = data;

  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new AppError(409, "Category with this name already exists");
  }

  return await prisma.category.create({
    data: { name, description },
  });
};

export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Category> => {
  const { name, description } = data;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (name && name !== category.name) {
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new AppError(409, "Category with this name already exists");
    }
  }

  return await prisma.category.update({
    where: { id },
    data: { name, description },
  });
};

export const deleteCategory = async (id: string): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const propertyCount = await prisma.property.count({
    where: { categoryId: id },
  });

  if (propertyCount > 0) {
    throw new AppError(
      400,
      "Cannot delete category because it is referenced by existing properties"
    );
  }

  return await prisma.category.delete({
    where: { id },
  });
};
