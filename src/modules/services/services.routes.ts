import { Router } from "express";
import * as servicesController from "./services.controller";
import { getServicesQuerySchema } from "./services.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.get("/", validate(getServicesQuerySchema), servicesController.getServices);

export const servicesRoutes = router;
