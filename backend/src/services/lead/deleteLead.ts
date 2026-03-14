import type { ServiceResponse } from "@domain";
import { frappeClient } from "@frappe/frappeClient";
import { logger } from "@utils/logger";

/**
 * Delete a lead from Frappe CRM
 * @param leadId - Lead ID to delete
 * @returns Promise with deletion status
 */
export const deleteLeadService = async (
  leadId: string,
): Promise<ServiceResponse> => {
  try {
    logger.info("Deleting lead from Frappe", { leadId });

    const endpoint = `/api/resource/Lead/${leadId}`;
    await frappeClient.delete(endpoint);

    return {
      success: true,
      message: `Lead deleted successfully: ${leadId}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to delete lead", {
      error: errorMessage,
      leadId,
    });

    return {
      success: false,
      message: "Failed to delete lead",
      error: errorMessage,
    };
  }
};
