import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { exclude } from "../auth/auth.service";

export const getTechnicians = async (filters: {
  search?: string;
  location?: string;
  skills?: string;
  rating?: string;
}) => {
  const { search, location, skills, rating } = filters;

  const users = await prisma.user.findMany({
    where: {
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
    include: {
      technicianProfile: true,
      services: true,
      reviewsReceived: {
        select: {
          rating: true,
        },
      },
    },
  });

  let results = users.map((u) => {
    const reviews = u.reviewsReceived || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      profile: u.technicianProfile,
      services: u.services.map((s) => ({
        id: s.id,
        title: s.title,
        price: s.price,
        location: s.location,
      })),
      averageRating: parseFloat(avgRating.toFixed(2)),
    };
  });

  // Apply filters
  if (skills) {
    const skillList = skills.split(",").map((s) => s.trim().toLowerCase());
    results = results.filter((tech) => {
      const techSkills = tech.profile?.skills.map((s: string) => s.toLowerCase()) || [];
      return skillList.some((s) => techSkills.includes(s));
    });
  }

  if (location) {
    const locQuery = location.toLowerCase();
    results = results.filter((tech) =>
      tech.services.some((s) => s.location.toLowerCase().includes(locQuery))
    );
  }

  if (search) {
    const query = search.toLowerCase();
    results = results.filter(
      (tech) =>
        tech.name.toLowerCase().includes(query) ||
        tech.email.toLowerCase().includes(query) ||
        tech.profile?.bio?.toLowerCase().includes(query)
    );
  }

  if (rating) {
    const minRating = parseFloat(rating);
    if (!isNaN(minRating)) {
      results = results.filter((tech) => tech.averageRating >= minRating);
    }
  }

  return results;
};

export const getTechnicianById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      role: "TECHNICIAN",
    },
    include: {
      technicianProfile: true,
      services: {
        include: {
          category: true,
        },
      },
      reviewsReceived: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "Technician not found");
  }

  const reviews = user.reviewsReceived || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const userResponse = exclude(user, ["password"]);

  return {
    ...userResponse,
    averageRating: parseFloat(avgRating.toFixed(2)),
  };
};

export const updateProfile = async (
  userId: string,
  data: { skills: string[]; experience: number; hourlyRate: number; bio?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "TECHNICIAN") {
    throw new AppError(403, "Only technicians can create or update a profile");
  }

  const profile = await prisma.technicianProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });

  return profile;
};

export const updateAvailability = async (userId: string, isAvailable: boolean) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(404, "Technician profile not found. Please create a profile first.");
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId },
    data: { isAvailable },
  });

  return updatedProfile;
};
