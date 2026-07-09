import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import apiRoutes from "./routes";
import { paymentsRoutes } from "./modules/payments/payments.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { AppError } from "./utils/errors";

const app: Application = express();

// --- Global Security & Pre-parsing Middlewares ---
app.use(cors());
app.use(helmet());

// --- Stripe Webhook & Payment routes (mounted before global JSON parsing) ---
app.use("/api/payments", paymentsRoutes);

// --- API Documentation Route ---
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Standard Global JSON / URLencoded Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Route ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "FixItNow API is running",
  });
});

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Catch-All 404 Handler for Unmatched Routes ---
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "Route not found"));
});

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
