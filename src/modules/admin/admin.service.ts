import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { User, Category, UserStatus, BookingStatus } from "@prisma/client";

// Get all users
export const getUsers = async (filters: {
  role?: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
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

// Update user status (ban/unban)
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

// Get all bookings
export const getBookings = async (filters: {
  status?: BookingStatus;
  page: number;
  limit: number;
}) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (status) whereClause.status = status;

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          include: {
            category: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    bookings,
  };
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

// Create a category with auto slug
export const createCategory = async (data: { name: string }): Promise<Category> => {
  const { name } = data;

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { name },
        { slug },
      ],
    },
  });

  if (existingCategory) {
    throw new AppError(409, "Category with this name or slug already exists");
  }

  return await prisma.category.create({
    data: {
      name,
      slug,
    },
  });
};
