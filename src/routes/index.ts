import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoriesRoutes } from "../modules/categories/categories.routes";
import { propertiesRoutes } from "../modules/properties/properties.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/properties", propertiesRoutes);

export default router;
