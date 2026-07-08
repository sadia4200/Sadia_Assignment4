import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("A valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  role: z.enum(["TENANT", "LANDLORD"], {
    message: "Role is required and must be either TENANT or LANDLORD",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
