import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoriesRoutes } from "../modules/categories/categories.routes";
import { propertiesRoutes } from "../modules/properties/properties.routes";
import { landlordPropertiesRoutes, landlordRequestsRoutes } from "../modules/properties/landlordProperties.routes";
import { rentalsRoutes } from "../modules/rentals/rentals.routes";
import { reviewsRoutes } from "../modules/reviews/reviews.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/properties", propertiesRoutes);
router.use("/rentals", rentalsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/admin", adminRoutes);
router.use("/landlord/properties", auth, authorizeRoles("LANDLORD"), landlordPropertiesRoutes);
router.use("/landlord/requests", auth, authorizeRoles("LANDLORD"), landlordRequestsRoutes);

export default router;
