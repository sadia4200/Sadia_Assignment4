import { Router } from "express";
import * as propertiesController from "./properties.controller";
import { createPropertySchema, updatePropertySchema, getLandlordPropertiesSchema } from "./properties.validation";
import { validate } from "../../middlewares/validate.middleware";
import * as rentalsController from "../rentals/rentals.controller";
import { getRentalsSchema, landlordActionSchema } from "../rentals/rentals.validation";

const propertiesRouter = Router();

propertiesRouter.post("/", validate(createPropertySchema), propertiesController.createLandlordProperty);
propertiesRouter.put("/:id", validate(updatePropertySchema), propertiesController.updateLandlordProperty);
propertiesRouter.delete("/:id", propertiesController.deleteLandlordProperty);
propertiesRouter.get("/", validate(getLandlordPropertiesSchema), propertiesController.getLandlordProperties);

export const landlordPropertiesRoutes = propertiesRouter;

const requestsRouter = Router();

requestsRouter.get("/", validate(getRentalsSchema), rentalsController.getLandlordRequests);
requestsRouter.patch("/:id", validate(landlordActionSchema), rentalsController.processRequest);

export const landlordRequestsRoutes = requestsRouter;
