import type { Request, Response } from "express";
import type { CreateLeadRequest, Lead } from "@domain/lead";
import type { ApiResponse } from "@domain";
import { createLeadService } from "@services/lead";
import { logger, isValidEmail, sanitizeString } from "@utils/index";

export const createLeadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const leadData = req.body as CreateLeadRequest;

    // Validate required fields
    if (
      !leadData.firstName ||
      !leadData.lastName ||
      !leadData.email ||
      !leadData.phone
    ) {
      const response: ApiResponse = {
        success: false,
        message: "First name, last name, email, and phone are required",
        error: "Validation failed",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // Validate email format
    if (!isValidEmail(leadData.email)) {
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
    leadData.firstName = sanitizeString(leadData.firstName, 100);
    leadData.lastName = sanitizeString(leadData.lastName, 100);
    leadData.email = sanitizeString(leadData.email, 254);
    leadData.phone = sanitizeString(leadData.phone, 20);
    if (leadData.message) {
      leadData.message = sanitizeString(leadData.message, 2000);
    }

    const result = await createLeadService(leadData);

    if (result.success) {
      const response: ApiResponse<Lead> = {
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
    logger.error("Error in createLeadController:", error);
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
