import { frappeClient } from "./frappeClient.js";
import { logger } from "@utils/logger";

/**
 * Example usage of FrappeClient

 *
 * This module demonstrates how to use the reusable Frappe API client
 * in your services and controllers.
 */

/**
 * Example: Fetch a Frappe document
 */
export const fetchFrappeDocument = async (
  doctype: string,
  docname: string,
): Promise<Record<string, unknown>> => {
  try {
    const endpoint = `/api/resource/${doctype}/${docname}`;
    const data = await frappeClient.get<Record<string, unknown>>(endpoint);
    logger.info(`Fetched ${doctype}: ${docname}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch ${doctype}: ${docname}`, error);
    throw error;
  }
};

/**
 * Example: Create a Frappe document
 */
export const createFrappeDocument = async (
  doctype: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  try {
    const endpoint = `/api/resource/${doctype}`;
    const data = await frappeClient.post<Record<string, unknown>>(
      endpoint,
      payload,
    );
    logger.info(`Created new ${doctype}`);
    return data;
  } catch (error) {
    logger.error(`Failed to create ${doctype}`, error);
    throw error;
  }
};

/**
 * Example: Update a Frappe document
 */
export const updateFrappeDocument = async (
  doctype: string,
  docname: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  try {
    const endpoint = `/api/resource/${doctype}/${docname}`;
    const data = await frappeClient.put<Record<string, unknown>>(
      endpoint,
      payload,
    );
    logger.info(`Updated ${doctype}: ${docname}`);
    return data;
  } catch (error) {
    logger.error(`Failed to update ${doctype}: ${docname}`, error);
    throw error;
  }
};

/**
 * Example: Delete a Frappe document
 */
export const deleteFrappeDocument = async (
  doctype: string,
  docname: string,
): Promise<void> => {
  try {
    const endpoint = `/api/resource/${doctype}/${docname}`;
    await frappeClient.delete(endpoint);
    logger.info(`Deleted ${doctype}: ${docname}`);
  } catch (error) {
    logger.error(`Failed to delete ${doctype}: ${docname}`, error);
    throw error;
  }
};

/**
 * Example: Query Frappe documents
 */
export const queryFrappeDocuments = async (
  doctype: string,
  filters?: Record<string, unknown>,
  fields?: string[],
): Promise<Record<string, unknown>[]> => {
  try {
    const endpoint = `/api/resource/${doctype}`;
    const params: Record<string, unknown> = {};

    if (filters) {
      params.filters = JSON.stringify(filters);
    }

    if (fields && fields.length > 0) {
      params.fields = JSON.stringify(fields);
    }

    const response = await frappeClient.get<{
      data: Record<string, unknown>[];
    }>(endpoint, params, { isFullResponse: false });

    logger.info(`Queried ${doctype} documents`);

    // Handle both direct array response and nested data response
    return Array.isArray(response) ? response : (
        (response as unknown as { data: Record<string, unknown>[] })?.data || []
      );
  } catch (error) {
    logger.error(`Failed to query ${doctype}`, error);
    throw error;
  }
};
