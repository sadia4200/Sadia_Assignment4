import { Router } from "express";
import * as authController from "./auth.controller";
import { validateRegister, validateLogin } from "./auth.validation";
import { auth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", auth, authController.getMe);

export const authRoutes = router;
