import type { ServiceResponse } from "@domain";
import type { CreateLeadRequest, Lead } from "@domain/lead";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Create a new lead in Frappe CRM
 * @param leadData - Lead data to create
 * @returns Promise with created lead details
 */
export const createLeadService = async (
  leadData: CreateLeadRequest,
): Promise<ServiceResponse<Lead>> => {
  try {
    logger.info("Creating lead in Frappe", {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
    });

    const endpoint = "/api/resource/Lead";
    // vehicleProperties format: "Color Make Model Year"
    // e.g. "Red Porsche 911 GT3 Touring 2023"
    const payload = {
      first_name: leadData.firstName,
      last_name: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      vehicle_properties: leadData.vehicleProperties,
      message: leadData.message,
      source: leadData.source || null,
      status: leadData.status || "New",
    };

    const response = await frappeClient.post<Lead>(endpoint, payload);

    return {
      success: true,
      message: `Lead created successfully: ${leadData.firstName} ${leadData.lastName}`,
      data: response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to create lead", {
      error: errorMessage,
    });

    return {
      success: false,
      message: "Failed to create lead",
      error: errorMessage,
    };
  }
};
