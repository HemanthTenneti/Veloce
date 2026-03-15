import type { Request, Response } from "express";
import type { Vehicle, VehicleQueryFilters } from "@domain/vehicle";
import type { ApiResponse } from "@domain";
import { getVehiclesService } from "@services/vehicle";
import { logger } from "@utils/logger";

export const getVehiclesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract query parameters and build filters
    const filters: VehicleQueryFilters = {};

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
    if (req.query.make) {
      filters.make = req.query.make as string;
    }
    if (req.query.model) {
      filters.model = req.query.model as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    if (req.query.minYear) {
      filters.minYear = parseInt(req.query.minYear as string, 10);
    }
    if (req.query.maxYear) {
      filters.maxYear = parseInt(req.query.maxYear as string, 10);
    }
    if (req.query.minPrice) {
      filters.minPrice = parseInt(req.query.minPrice as string, 10);
    }
    if (req.query.maxPrice) {
      filters.maxPrice = parseInt(req.query.maxPrice as string, 10);
    }
    if (req.query.minMileage) {
      filters.minMileage = parseInt(req.query.minMileage as string, 10);
    }
    if (req.query.maxMileage) {
      filters.maxMileage = parseInt(req.query.maxMileage as string, 10);
    }

    const locale = typeof req.query.locale === "string" ? req.query.locale : "en";
    const result = await getVehiclesService(filters, locale);

    if (result.success) {
      const response: ApiResponse<Vehicle[]> = {
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
    logger.error("Error in getVehiclesController:", error);
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
