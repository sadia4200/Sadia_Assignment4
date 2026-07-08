import { Router } from "express";
import * as reviewsController from "./reviews.controller";
import { createReviewSchema } from "./reviews.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.use(auth);

router.post(
  "/",
  authorizeRoles("TENANT"),
  validate(createReviewSchema),
  reviewsController.createReview
);

export const reviewsRoutes = router;
