import type { ServiceResponse } from "@domain";
import type { UpdateVehicleRequest, Vehicle } from "@domain/vehicle";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

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

    // Build payload with only provided fields
    const payload: Record<string, unknown> = {};

    if (vehicleData.make !== undefined) payload.make = vehicleData.make;
    if (vehicleData.model !== undefined) payload.model = vehicleData.model;
    if (vehicleData.year !== undefined) payload.year = vehicleData.year;
    if (vehicleData.vin !== undefined) payload.vin = vehicleData.vin;
    if (vehicleData.mileage !== undefined)
      payload.mileage = vehicleData.mileage;
    if (vehicleData.price !== undefined) payload.price = vehicleData.price;
    if (vehicleData.description !== undefined)
      payload.description = vehicleData.description;
    if (vehicleData.images !== undefined) payload.images = vehicleData.images;
    if (vehicleData.status !== undefined) payload.status = vehicleData.status;

    const response = await frappeClient.put<Vehicle>(endpoint, payload);

    return {
      success: true,
      message: `Vehicle updated successfully: ${vehicleId}`,
      data: response,
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
