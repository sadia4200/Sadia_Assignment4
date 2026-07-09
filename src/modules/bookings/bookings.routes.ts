import { Router } from "express";
import * as bookingsController from "./bookings.controller";
import { createBookingSchema, getBookingByIdSchema } from "./bookings.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.use(auth);

// Customer bookings CRUD
router.post("/", authorizeRoles("CUSTOMER"), validate(createBookingSchema), bookingsController.createBooking);
router.get("/", authorizeRoles("CUSTOMER"), bookingsController.getMyBookings);
router.get("/:id", authorizeRoles("CUSTOMER", "TECHNICIAN", "ADMIN"), validate(getBookingByIdSchema), bookingsController.getBookingById);

export const bookingsRoutes = router;
