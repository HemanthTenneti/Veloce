import type { ServiceResponse } from "@domain";
import type { CreateVehicleRequest, Vehicle } from "@domain/vehicle";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Create a new vehicle in Frappe CRM
 * @param vehicleData - Vehicle data to create
 * @returns Promise with created vehicle details
 */
export const createVehicleService = async (
  vehicleData: CreateVehicleRequest,
): Promise<ServiceResponse<Vehicle>> => {
  try {
    logger.info("Creating vehicle in Frappe", {
      make: vehicleData.make,
      model: vehicleData.model,
    });

    const endpoint = "/api/resource/Vehicle Inventory";
    const payload = {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vin: vehicleData.vin || null,
      mileage: vehicleData.mileage || null,
      price: vehicleData.price || null,
      description: vehicleData.description || null,
      images: vehicleData.images,
      status: vehicleData.status,
    };

    const response = await frappeClient.post<Vehicle>(endpoint, payload);

    return {
      success: true,
      message: `Vehicle created successfully: ${vehicleData.make} ${vehicleData.model}`,
      data: response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to create vehicle", {
      error: errorMessage,
      make: vehicleData.make,
      model: vehicleData.model,
    });

    return {
      success: false,
      message: "Failed to create vehicle",
      error: errorMessage,
    };
  }
};
