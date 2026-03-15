import type { ServiceResponse } from "@domain";
import type { Vehicle } from "@domain/vehicle";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";
import {
  type FrappeVehicleRecord,
  normalizeVehicle,
} from "./vehicleMapper.js";

/**
 * Get a specific vehicle from Frappe CRM
 * @param vehicleId - Vehicle ID to retrieve
 * @returns Promise with vehicle details
 */
export const getVehicleService = async (
  vehicleId: string,
): Promise<ServiceResponse<Vehicle>> => {
  try {
    logger.info("Fetching vehicle from Frappe", { vehicleId });

    const endpoint = `/api/resource/Vehicle Inventory/${vehicleId}`;
    const response = await frappeClient.get<FrappeVehicleRecord>(endpoint);

    return {
      success: true,
      message: `Vehicle retrieved successfully: ${vehicleId}`,
      data: normalizeVehicle(response),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to fetch vehicle", { error: errorMessage, vehicleId });

    return {
      success: false,
      message: "Failed to retrieve vehicle",
      error: errorMessage,
    };
  }
};
