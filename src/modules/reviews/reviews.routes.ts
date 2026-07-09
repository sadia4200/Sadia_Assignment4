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
  authorizeRoles("CUSTOMER"),
  validate(createReviewSchema),
  reviewsController.createReview
);

export const reviewsRoutes = router;
