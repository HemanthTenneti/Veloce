import type { Request, Response } from "express";
import type { UpdateLeadRequest, Lead } from "@domain/lead";
import type { ApiResponse } from "@domain";
import { updateLeadService } from "@services/lead";
import { logger, isValidEmail, sanitizeString } from "@utils/index";

export const updateLeadController = async (
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

    const updateData = req.body as UpdateLeadRequest;

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

    // Validate email format if provided
    if (updateData.email && !isValidEmail(updateData.email)) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid email address format",
        error: "Validation failed",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // Sanitize string inputs
    if (updateData.firstName)
      updateData.firstName = sanitizeString(updateData.firstName, 100);
    if (updateData.lastName)
      updateData.lastName = sanitizeString(updateData.lastName, 100);
    if (updateData.email)
      updateData.email = sanitizeString(updateData.email, 254);
    if (updateData.phone)
      updateData.phone = sanitizeString(updateData.phone, 20);
    if (updateData.message)
      updateData.message = sanitizeString(updateData.message, 2000);

    const result = await updateLeadService(id, updateData);

    if (result.success) {
      const response: ApiResponse<Lead> = {
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
    logger.error("Error in updateLeadController:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ?
          (error instanceof Error ? error.message : "Unknown error")
        : "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
};
