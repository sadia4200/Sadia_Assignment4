import { Router } from "express";
import * as rentalsController from "./rentals.controller";
import { createRentalSchema, getRentalsSchema } from "./rentals.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

// Apply auth middleware to all rental request endpoints
router.use(auth);

router.post("/", authorizeRoles("TENANT"), validate(createRentalSchema), rentalsController.createRequest);
router.get("/", validate(getRentalsSchema), rentalsController.getRequests);
router.get("/:id", rentalsController.getRequestDetails);

export const rentalsRoutes = router;
