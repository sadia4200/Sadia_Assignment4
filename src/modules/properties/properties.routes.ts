import { Router } from "express";
import * as propertiesController from "./properties.controller";
import { getPropertiesSchema } from "./properties.validation";
import { validate } from "../../middlewares/validate.middleware";
import * as reviewsController from "../reviews/reviews.controller";
import { getPropertyReviewsSchema } from "../reviews/reviews.validation";

const router = Router();

router.get("/", validate(getPropertiesSchema), propertiesController.getProperties);
router.get("/:id", propertiesController.getProperty);
router.get("/:id/reviews", validate(getPropertyReviewsSchema), reviewsController.getPropertyReviews);

export const propertiesRoutes = router;
