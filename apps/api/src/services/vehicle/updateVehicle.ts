import type { ServiceResponse } from "@domain";
import type { UpdateVehicleRequest, Vehicle } from "@domain/vehicle";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";
import {
  type FrappeVehicleRecord,
  normalizeVehicle,
  toFrappeVehiclePayload,
} from "./vehicleMapper.js";

/**
 * Update an existing vehicle in Frappe CRM
 * @param vehicleId - Vehicle ID to update
 * @param vehicleData - Updated vehicle data (partial update allowed)
 * @returns Promise with updated vehicle details
 */
export const updateVehicleService = async (
  vehicleId: string,
  vehicleData: UpdateVehicleRequest,
): Promise<ServiceResponse<Vehicle>> => {
  try {
    logger.info("Updating vehicle in Frappe", {
      vehicleId,
      updatedFields: Object.keys(vehicleData),
    });

    const endpoint = `/api/resource/Vehicle Inventory/${vehicleId}`;
    const payload = toFrappeVehiclePayload(vehicleData);

    const response = await frappeClient.put<FrappeVehicleRecord>(endpoint, payload);

    return {
      success: true,
      message: `Vehicle updated successfully: ${vehicleId}`,
      data: normalizeVehicle(response),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to update vehicle", {
      error: errorMessage,
      vehicleId,
    });

    return {
      success: false,
      message: "Failed to update vehicle",
      error: errorMessage,
    };
  }
};
