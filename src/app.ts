import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app: Application = express();

// --- Global Middlewares ---
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Route ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RentNest API is running",
  });
});

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
