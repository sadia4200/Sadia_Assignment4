import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoriesRoutes } from "../modules/categories/categories.routes";
import { propertiesRoutes } from "../modules/properties/properties.routes";
import { landlordPropertiesRoutes } from "../modules/properties/landlordProperties.routes";
import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/properties", propertiesRoutes);
router.use("/landlord/properties", auth, authorizeRoles("LANDLORD"), landlordPropertiesRoutes);

export default router;
