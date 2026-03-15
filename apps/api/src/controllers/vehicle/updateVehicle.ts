import type { Request, Response } from "express";
import type { UpdateVehicleRequest, Vehicle } from "@domain/vehicle";
import type { ApiResponse } from "@domain";
import { updateVehicleService } from "@services/vehicle";
import { logger } from "@utils/logger";

export const updateVehicleController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: "Vehicle ID is required",
        error: "Missing required parameter",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const updateData = req.body as UpdateVehicleRequest;

    if (Object.keys(updateData).length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No fields to update",
        error: "Update data is empty",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const result = await updateVehicleService(id, updateData);

    if (result.success) {
      const response: ApiResponse<Vehicle> = {
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
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
    logger.error("Error in updateVehicleController:", error);
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
