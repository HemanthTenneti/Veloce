import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { logger } from "@utils/logger";
import { errorHandler } from "@middleware/errorHandler";
import healthRoutes from "@routes/healthRoutes";
import apiRoutes from "@routes/index";
import { env } from "@config/env";

const app: Express = express();

// Security headers (includes X-Powered-By removal, CSP, HSTS, etc.)
app.use(helmet());

// Rate limiting - general API (100 requests per 15 min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    timestamp: new Date().toISOString(),
  },
});

// Stricter rate limit for write operations (30 per 15 min per IP)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests, please try again later",
    timestamp: new Date().toISOString(),
  },
});

// CORS configuration
// credentials: true requires a specific origin, not wildcard "*"
const corsOrigin = env.cors.origin;
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  }),
);

// Logging middleware
const morganFormat = env.server.env === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Body parser middleware with size limits to prevent payload DoS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Apply general rate limiter to all API routes
app.use("/api", apiLimiter);

// Apply stricter rate limiter to lead creation (prevent spam on enquiry form)
app.use("/api/leads", writeLimiter);

// Health check routes (root path)
app.use(healthRoutes);

// API routes
app.use("/api", apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(env.server.port, env.server.host, () => {
  logger.info(
    `Server is running on ${env.server.host}:${env.server.port} in ${env.server.env} mode`,
  );
});

export default app;
