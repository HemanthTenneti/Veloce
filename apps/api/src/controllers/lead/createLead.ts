import type { Request, Response } from "express";
import type { CreateLeadRequest, Lead } from "@domain/lead";
import type { ApiResponse } from "@domain";
import { createLeadService } from "@services/lead";
import { logger, sanitizeString } from "@utils/index";
import { createLeadSchema } from "@veloce/shared";
import { ZodError } from "zod";

export const createLeadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Zod is the gatekeeper — throws ZodError on any schema violation
    const validated = createLeadSchema.parse(req.body);

    // Sanitize after validation to strip excess whitespace / truncate lengths
    const leadData: CreateLeadRequest = {
      firstName: sanitizeString(validated.firstName, 100),
      lastName: sanitizeString(validated.lastName, 100),
      email: sanitizeString(validated.email, 254),
      phone: sanitizeString(validated.phone, 20),
      // vehicleProperties format: "Color Make Model Year"
      vehicleProperties: sanitizeString(validated.vehicleProperties, 200),
      message: sanitizeString(validated.message, 2000),
      ...(validated.source !== undefined && {
        source: sanitizeString(validated.source, 100),
      }),
      ...(validated.status !== undefined && { status: validated.status }),
    };

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
    if (error instanceof ZodError) {
      const response: ApiResponse = {
        success: false,
        message: "Validation failed",
        error: error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    logger.error("Error in createLeadController:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
};
