import { Router, Request, Response } from "express";
import { frappeClient } from "@frappe/frappeClient";
import { env } from "@config/env";
import { logger } from "@utils/logger";

const router = Router();

// Server start time for uptime calculation
const SERVER_START_TIME = Date.now();

const isProduction = env.server.env === "production";

/**
 * Get server uptime in seconds
 */
function getUptime(): number {
  return Math.floor((Date.now() - SERVER_START_TIME) / 1000);
}

/**
 * Root endpoint - Basic API information
 * GET /
 */
router.get("/", (_req: Request, res: Response): void => {
  res.json({
    name: "AutoCRM Backend API",
    version: "1.0.0",
    status: "running",
    uptime: getUptime(),
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      api: "/api",
      vehicles: "/api/vehicles",
      leads: "/api/leads",
      payments: "/api/payments",
    },
  });
});

/**
 * Health check endpoint - Detailed system status
 * GET /health
 *
 * Returns:
 * - Server status and uptime
 * - Frappe connectivity status
 * - Overall system health status
 */
router.get("/health", async (_req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();

    // Check Frappe connectivity
    let frappeStatus = "healthy";
    let frappeResponseTime = 0;

    try {
      const frappeStartTime = Date.now();
      const isFrappeHealthy = await frappeClient.healthCheck();
      frappeResponseTime = Date.now() - frappeStartTime;

      if (!isFrappeHealthy) {
        frappeStatus = "unhealthy";
      }
    } catch (error) {
      frappeStatus = "unhealthy";
      logger.error("Frappe health check failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    // Determine overall health
    const overallStatus = frappeStatus === "healthy" ? "healthy" : "degraded";

    const healthResponse: Record<string, unknown> = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      checks: {
        server: true,
        frappe: frappeStatus === "healthy",
      },
      responseTime: `${totalResponseTime}ms`,
    };

    // Only expose detailed infrastructure info in non-production
    if (!isProduction) {
      healthResponse.server = {
        status: "healthy",
        environment: env.server.env,
        host: env.server.host,
        port: env.server.port,
      };
      healthResponse.frappe = {
        status: frappeStatus,
        url: env.frappe.url,
        responseTime: `${frappeResponseTime}ms`,
      };
    }

    res.status(overallStatus === "healthy" ? 200 : 503).json(healthResponse);
  } catch (error) {
    logger.error("Health check endpoint error", { error });
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "Internal server error",
    });
  }
});

export default router;
