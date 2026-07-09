import { z } from "zod";

export const getTechniciansQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    location: z.string().optional(),
    skills: z.string().optional(),
    rating: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    skills: z.array(z.string().trim().min(1, "Skill cannot be empty")).nonempty("At least one skill is required"),
    experience: z.number().int().min(0, "Experience must be a positive integer"),
    hourlyRate: z.number().positive("Hourly rate must be a positive number"),
    bio: z.string().optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export const getTechnicianByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid technician ID format"),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid booking ID format"),
  }),
  body: z.object({
    status: z.enum(["REQUESTED", "ACCEPTED", "DECLINED", "PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
      message: "Invalid booking status value",
    }),
  }),
});
