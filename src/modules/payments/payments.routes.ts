import express, { Router } from "express";
import * as paymentsController from "./payments.controller";
import { createPaymentSchema, getPaymentsSchema } from "./payments.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

// 1. Webhook endpoint: Needs raw body parser (express.raw)
// Mounted before express.json() is applied in this router.
router.post(
  "/confirm",
  express.raw({ type: "application/json" }),
  paymentsController.handleStripeWebhook
);

// 2. Client-facing endpoints: Need JSON body parser + JWT auth
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(auth);

router.post(
  "/create",
  authorizeRoles("TENANT"),
  validate(createPaymentSchema),
  paymentsController.createSession
);

router.get("/", validate(getPaymentsSchema), paymentsController.getHistory);
router.get("/:id", paymentsController.getDetails);

export const paymentsRoutes = router;
