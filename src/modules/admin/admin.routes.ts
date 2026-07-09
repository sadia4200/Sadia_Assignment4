import { Router } from "express";
import * as adminController from "./admin.controller";
import {
  getUsersSchema,
  updateUserStatusSchema,
  getBookingsSchema,
  createCategorySchema,
} from "./admin.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

// Apply auth and admin checks on all routes under /api/admin
router.use(auth);
router.use(authorizeRoles("ADMIN"));

// User oversight
router.get("/users", validate(getUsersSchema), adminController.getUsers);
router.patch("/users/:id", validate(updateUserStatusSchema), adminController.updateUserStatus);

// Bookings oversight
router.get("/bookings", validate(getBookingsSchema), adminController.getBookings);

// Categories CRUD oversight
router.get("/categories", adminController.getCategories);
router.post("/categories", validate(createCategorySchema), adminController.createCategory);

export const adminRoutes = router;
