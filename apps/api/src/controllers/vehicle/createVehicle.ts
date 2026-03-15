import type { Request, Response } from "express";
import { ZodError } from "zod";
import { VehicleSchema } from "@veloce/shared";
import type { CreateVehicleRequest, Vehicle } from "@domain/vehicle";
import type { ApiResponse } from "@domain";
import { createVehicleService } from "@services/vehicle";
import { logger } from "@utils/logger";

export const createVehicleController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData: CreateVehicleRequest = VehicleSchema.parse(req.body);

    const result = await createVehicleService(validatedData);

    if (result.success) {
      const response: ApiResponse<Vehicle> = {
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid vehicle payload",
        error: error.issues.map(issue => issue.message).join("; "),
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    logger.error("Error in createVehicleController:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ?
          error instanceof Error ?
            error.message
          : "Unknown error"
        : "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
};
