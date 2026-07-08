import { Router } from "express";
import * as propertiesController from "./properties.controller";
import { createPropertySchema, updatePropertySchema, getLandlordPropertiesSchema } from "./properties.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/", validate(createPropertySchema), propertiesController.createLandlordProperty);
router.put("/:id", validate(updatePropertySchema), propertiesController.updateLandlordProperty);
router.delete("/:id", propertiesController.deleteLandlordProperty);
router.get("/", validate(getLandlordPropertiesSchema), propertiesController.getLandlordProperties);

export const landlordPropertiesRoutes = router;
