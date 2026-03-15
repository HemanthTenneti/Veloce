import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger";
import type { ApiResponse } from "@domain";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
  });

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development" ?
        err.message
      : "An error occurred",
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
};
