import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import config from "../../config";
import { AppError } from "../../utils/errors";
import { User, Role } from "@prisma/client";

const SALT_ROUNDS = 12;

// Utility to exclude fields from model
export function exclude<UserType, Key extends keyof UserType>(
  user: UserType,
  keys: Key[]
): Omit<UserType, Key> {
  const clone = { ...user };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

export interface AuthSuccessPayload {
  user: Omit<User, "password">;
  token: string;
}

const generateToken = (userId: string, role: Role): string => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expires_in as any }
  );
};

export const registerUser = async (data: any): Promise<AuthSuccessPayload> => {
  const { name, email, password, phone, role } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role as Role,
      status: "ACTIVE",
    },
  });

  // Generate JWT
  const token = generateToken(newUser.id, newUser.role);
  const userResponse = exclude(newUser, ["password"]);

  return {
    user: userResponse,
    token,
  };
};

export const loginUser = async (data: any): Promise<AuthSuccessPayload> => {
  const { email, password } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  // Check password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  // Check if banned
  if (user.status === "BANNED") {
    throw new AppError(403, "Your account has been banned. Please contact administration.");
  }

  // Generate JWT
  const token = generateToken(user.id, user.role);
  const userResponse = exclude(user, ["password"]);

  return {
    user: userResponse,
    token,
  };
};

export const getUserById = async (userId: string): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User profile not found");
  }

  return exclude(user, ["password"]);
};
