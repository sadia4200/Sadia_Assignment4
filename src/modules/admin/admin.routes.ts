import { Router } from "express";
import * as adminController from "./admin.controller";
import {
  getUsersSchema,
  updateUserStatusSchema,
  getPropertiesSchema,
  getRentalsSchema,
  getPaymentsSchema,
  createCategorySchema,
  updateCategorySchema,
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

// Oversight logs
router.get("/properties", validate(getPropertiesSchema), adminController.getProperties);
router.get("/rentals", validate(getRentalsSchema), adminController.getRentals);
router.get("/payments", validate(getPaymentsSchema), adminController.getPayments);

// Category CRUD
router.post("/categories", validate(createCategorySchema), adminController.createCategory);
router.put("/categories/:id", validate(updateCategorySchema), adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

export const adminRoutes = router;
