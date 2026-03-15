import type { ServiceResponse } from "@domain";
import type { UpdateLeadRequest, Lead } from "@domain/lead";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Update an existing lead in Frappe CRM
 * @param leadId - Lead ID to update
 * @param leadData - Updated lead data (partial update allowed)
 * @returns Promise with updated lead details
 */
export const updateLeadService = async (
  leadId: string,
  leadData: UpdateLeadRequest,
): Promise<ServiceResponse<Lead>> => {
  try {
    logger.info("Updating lead in Frappe", {
      leadId,
      updatedFields: Object.keys(leadData),
    });

    const endpoint = `/api/resource/Lead/${leadId}`;

    // Build payload with only provided fields
    const payload: Record<string, unknown> = {};

    if (leadData.firstName !== undefined)
      payload.first_name = leadData.firstName;
    if (leadData.lastName !== undefined) payload.last_name = leadData.lastName;
    if (leadData.email !== undefined) payload.email = leadData.email;
    if (leadData.phone !== undefined) payload.phone = leadData.phone;
    if (leadData.vehicleProperties !== undefined)
      // vehicleProperties format: "Color Make Model Year"
      // e.g. "Red Porsche 911 GT3 Touring 2023"
      payload.vehicle_properties = leadData.vehicleProperties;
    if (leadData.message !== undefined) payload.message = leadData.message;
    if (leadData.status !== undefined) payload.status = leadData.status;
    if (leadData.source !== undefined) payload.source = leadData.source;
    if (leadData.lastContactedAt !== undefined)
      payload.last_contacted_at = leadData.lastContactedAt;

    const response = await frappeClient.put<Lead>(endpoint, payload);

    return {
      success: true,
      message: `Lead updated successfully: ${leadId}`,
      data: response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to update lead", {
      error: errorMessage,
      leadId,
    });

    return {
      success: false,
      message: "Failed to update lead",
      error: errorMessage,
    };
  }
};
