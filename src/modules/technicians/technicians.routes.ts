import { Router } from "express";
import * as techniciansController from "./technicians.controller";
import {
  getTechniciansQuerySchema,
  updateProfileSchema,
  updateAvailabilitySchema,
  getTechnicianByIdSchema,
  updateBookingStatusSchema,
} from "./technicians.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

// Public Router (mounted at /api/technicians)
const publicRouter = Router();
publicRouter.get("/", validate(getTechniciansQuerySchema), techniciansController.getTechnicians);
publicRouter.get("/:id", validate(getTechnicianByIdSchema), techniciansController.getTechnicianById);

// Private Router (mounted at /api/technician)
const privateRouter = Router();
privateRouter.use(auth);

privateRouter.put("/profile", authorizeRoles("TECHNICIAN"), validate(updateProfileSchema), techniciansController.updateProfile);
privateRouter.put("/availability", authorizeRoles("TECHNICIAN"), validate(updateAvailabilitySchema), techniciansController.updateAvailability);
privateRouter.get("/bookings", authorizeRoles("TECHNICIAN"), techniciansController.getTechnicianBookings);
privateRouter.patch("/bookings/:id", authorizeRoles("TECHNICIAN", "CUSTOMER"), validate(updateBookingStatusSchema), techniciansController.updateBookingStatus);

export const techniciansPublicRoutes = publicRouter;
export const technicianPrivateRoutes = privateRouter;
