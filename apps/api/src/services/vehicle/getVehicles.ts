import type { ServiceResponse } from "@domain";
import type { Vehicle, VehicleQueryFilters } from "@domain/vehicle";
import { frappeClient } from "@frappe/frappeClient";
import {
  logger,
  isAllowedSortField,
  sanitizePagination,
  sanitizeString,
} from "@utils/index";
import {
  type FrappeVehicleRecord,
  normalizeVehicle,
} from "./vehicleMapper.js";
import { localizeVehicles } from "./translationService.js";

/**
 * Get all vehicles from Frappe CRM with optional filtering
 * @param filters - Optional query filters for search, pagination, sorting
 * @returns Promise with list of vehicles
 */
export const getVehiclesService = async (
  filters?: VehicleQueryFilters,
  locale = "en",
): Promise<ServiceResponse<Vehicle[]>> => {
  try {
    logger.info("Fetching vehicles from Frappe", { filters });

    const endpoint = "/api/resource/Vehicle Inventory";

    // Build query parameters
    const params: Record<string, unknown> = {
      fields: '["*"]',
    };

    // Pagination — clamped to safe bounds (max 100 per page)
    const { page, pageSize: limit } = sanitizePagination(
      filters?.page,
      filters?.pageSize,
    );
    params.limit = limit;
    params.limit_start = (page - 1) * limit;

    // Sorting — only allow whitelisted field names to prevent injection
    if (filters?.sortBy) {
      if (isAllowedSortField(filters.sortBy, "vehicle")) {
        const dir = filters.sortOrder === "desc" ? "desc" : "asc";
        params.order_by = `${filters.sortBy} ${dir}`;
      } else {
        logger.warn("Rejected invalid sortBy field for vehicles", {
          sortBy: filters.sortBy,
        });
      }
    }

    // AND filters
    const andFilters: unknown[] = [];

    if (filters?.status) {
      andFilters.push(["Vehicle Inventory", "status", "=", filters.status]);
    }
    if (filters?.make) {
      andFilters.push([
        "Vehicle Inventory",
        "make",
        "like",
        `%${filters.make}%`,
      ]);
    }
    if (filters?.model) {
      andFilters.push([
        "Vehicle Inventory",
        "model",
        "like",
        `%${filters.model}%`,
      ]);
    }
    if (filters?.minYear) {
      andFilters.push(["Vehicle Inventory", "year", ">=", filters.minYear]);
    }
    if (filters?.maxYear) {
      andFilters.push(["Vehicle Inventory", "year", "<=", filters.maxYear]);
    }
    if (filters?.minPrice) {
      andFilters.push(["Vehicle Inventory", "price", ">=", filters.minPrice]);
    }
    if (filters?.maxPrice) {
      andFilters.push(["Vehicle Inventory", "price", "<=", filters.maxPrice]);
    }
    if (filters?.minMileage) {
      andFilters.push([
        "Vehicle Inventory",
        "mileage",
        ">=",
        filters.minMileage,
      ]);
    }
    if (filters?.maxMileage) {
      andFilters.push([
        "Vehicle Inventory",
        "mileage",
        "<=",
        filters.maxMileage,
      ]);
    }

    if (andFilters.length > 0) {
      params.filters = JSON.stringify(andFilters);
    }

    // OR filters for search across make, model, description
    if (filters?.search) {
      const search = sanitizeString(filters.search, 200);
      params.or_filters = JSON.stringify([
        ["Vehicle Inventory", "make", "like", `%${search}%`],
        ["Vehicle Inventory", "model", "like", `%${search}%`],
        ["Vehicle Inventory", "description", "like", `%${search}%`],
      ]);
    }

    const response = await frappeClient.get<FrappeVehicleRecord[]>(endpoint, params);
    const normalized = Array.isArray(response) ? response.map(normalizeVehicle) : [];
    const vehicles = await localizeVehicles(normalized, locale);

    return {
      success: true,
      message: `Retrieved ${vehicles.length} vehicles`,
      data: vehicles,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to fetch vehicles", { error: errorMessage, filters });

    return {
      success: false,
      message: "Failed to retrieve vehicles",
      error: errorMessage,
    };
  }
};
