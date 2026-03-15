import type { Request, Response } from "express";
import type { Lead } from "@domain/lead";
import type { ApiResponse } from "@domain";
import { getLeadsService } from "@services/lead";
import type { LeadQueryFilters } from "@services/lead";
import { logger } from "@utils/logger";

export const getLeadsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract query parameters and build filters
    const filters: LeadQueryFilters = {};

    // Pagination
    if (req.query.page) {
      filters.page = parseInt(req.query.page as string, 10);
    }
    if (req.query.pageSize) {
      filters.pageSize = parseInt(req.query.pageSize as string, 10);
    }

    // Sorting
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy as string;
    }
    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder as "asc" | "desc";
    }

    // Filtering
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.lastName) {
      filters.lastName = req.query.lastName as string;
    }
    if (req.query.email) {
      filters.email = req.query.email as string;
    }
    if (req.query.phone) {
      filters.phone = req.query.phone as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const result = await getLeadsService(filters);

    if (result.success) {
      const response: ApiResponse<Lead[]> = {
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
    logger.error("Error in getLeadsController:", error);
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
