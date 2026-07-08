import { Router } from "express";
import * as authController from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";
import { auth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", auth, authController.getMe);

export const authRoutes = router;
