import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { logger } from "@utils/logger";
import { errorHandler } from "@middleware/errorHandler";
import routes from "./routes";

const app: Express = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Rate limiting (100 requests per 15 min per IP)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later",
      timestamp: new Date().toISOString(),
    },
  }),
);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  }),
);

// Logging middleware
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Body parser middleware with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(
    `Server is running on port ${port} in ${process.env.NODE_ENV} mode`,
  );
});

export default app;
