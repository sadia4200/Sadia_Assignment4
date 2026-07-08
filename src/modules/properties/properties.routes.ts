import { Router } from "express";
import * as propertiesController from "./properties.controller";
import { getPropertiesSchema } from "./properties.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.get("/", validate(getPropertiesSchema), propertiesController.getProperties);
router.get("/:id", propertiesController.getProperty);

export const propertiesRoutes = router;
