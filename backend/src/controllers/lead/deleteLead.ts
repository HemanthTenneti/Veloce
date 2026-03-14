import type { Request, Response } from "express";
import type { ApiResponse } from "@domain";
import { deleteLeadService } from "@services/lead";
import { logger } from "@utils/logger";

export const deleteLeadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: "Lead ID is required",
        error: "Missing required parameter",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const result = await deleteLeadService(id);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        message: result.message,
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
    logger.error("Error in deleteLeadController:", error);
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
