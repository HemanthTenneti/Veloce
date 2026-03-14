import type { ServiceResponse } from "@domain";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Delete a vehicle from Frappe CRM
 * @param vehicleId - Vehicle ID to delete
 * @returns Promise with deletion status
 */
export const deleteVehicleService = async (
  vehicleId: string,
): Promise<ServiceResponse> => {
  try {
    logger.info("Deleting vehicle from Frappe", { vehicleId });

    const endpoint = `/api/resource/Vehicle Inventory/${vehicleId}`;
    await frappeClient.delete(endpoint);

    return {
      success: true,
      message: `Vehicle deleted successfully: ${vehicleId}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to delete vehicle", {
      error: errorMessage,
      vehicleId,
    });

    return {
      success: false,
      message: "Failed to delete vehicle",
      error: errorMessage,
    };
  }
};
