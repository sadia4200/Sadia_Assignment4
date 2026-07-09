import prisma from "../../config/prisma";

export const getServices = async (filters: {
  type?: string;
  location?: string;
  rating?: string;
  price?: string;
}) => {
  const { type, location, rating, price } = filters;

  const where: any = {};

  // Filter by category type (can match name, id or slug)
  if (type) {
    where.category = {
      OR: [
        { id: type },
        { slug: type },
        { name: { contains: type, mode: "insensitive" } },
      ],
    };
  }

  // Filter by location
  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  // Filter by price (max price)
  if (price) {
    const maxPrice = parseFloat(price);
    if (!isNaN(maxPrice)) {
      where.price = {
        lte: maxPrice,
      };
    }
  }

  // Fetch services including category and technician reviews
  const services = await prisma.service.findMany({
    where,
    include: {
      category: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          technicianProfile: true,
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  // Map services to compute average rating for each technician
  let results = services.map((service) => {
    const reviews = service.technician.reviewsReceived || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      location: service.location,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      categoryId: service.categoryId,
      category: service.category,
      technicianId: service.technicianId,
      technician: {
        id: service.technician.id,
        name: service.technician.name,
        email: service.technician.email,
        phone: service.technician.phone,
        status: service.technician.status,
        profile: service.technician.technicianProfile,
        averageRating: parseFloat(avgRating.toFixed(2)),
      },
    };
  });

  // Filter by rating if rating filter is provided
  if (rating) {
    const minRating = parseFloat(rating);
    if (!isNaN(minRating)) {
      results = results.filter((s) => s.technician.averageRating >= minRating);
    }
  }

  return results;
};
