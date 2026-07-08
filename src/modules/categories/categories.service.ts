import prisma from "../../config/prisma";
import { Category } from "@prisma/client";

export const getAllCategories = async (): Promise<Category[]> => {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
};
