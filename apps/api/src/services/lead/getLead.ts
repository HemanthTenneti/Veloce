import type { ServiceResponse } from "@domain";
import type { Lead } from "@domain/lead";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Get a specific lead from Frappe CRM
 * @param leadId - Lead ID to retrieve
 * @returns Promise with lead details
 */
export const getLeadService = async (
  leadId: string,
): Promise<ServiceResponse<Lead>> => {
  try {
    logger.info("Fetching lead from Frappe", { leadId });

    const endpoint = `/api/resource/Lead/${leadId}`;
    const response = await frappeClient.get<Lead>(endpoint);

    return {
      success: true,
      message: `Lead retrieved successfully: ${leadId}`,
      data: response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to fetch lead", { error: errorMessage, leadId });

    return {
      success: false,
      message: "Failed to retrieve lead",
      error: errorMessage,
    };
  }
};
