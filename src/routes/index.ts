import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoriesRoutes } from "../modules/categories/categories.routes";
import { servicesRoutes } from "../modules/services/services.routes";
import { bookingsRoutes } from "../modules/bookings/bookings.routes";
import { reviewsRoutes } from "../modules/reviews/reviews.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { techniciansPublicRoutes, technicianPrivateRoutes } from "../modules/technicians/technicians.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/services", servicesRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/admin", adminRoutes);
router.use("/technicians", techniciansPublicRoutes);
router.use("/technician", technicianPrivateRoutes);

export default router;
