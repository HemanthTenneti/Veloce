import type { ServiceResponse } from "@domain";
import type { Lead } from "@domain/lead";
import { frappeClient } from "@frappe/frappeClient";
import {
  logger,
  isAllowedSortField,
  sanitizePagination,
  sanitizeString,
} from "@utils/index";

export interface LeadQueryFilters {
  /// Filter by lead status
  status?: string;

  /// Filter by last name
  lastName?: string;

  /// Filter by email
  email?: string;

  /// Filter by phone
  phone?: string;

  /// Search term to match against firstName, lastName, email, or phone
  search?: string;

  /// Sort field (e.g., 'creation', 'modified')
  sortBy?: string;

  /// Sort order: 'asc' or 'desc'
  sortOrder?: "asc" | "desc";

  /// Page number for pagination (1-indexed)
  page?: number;

  /// Items per page
  pageSize?: number;
}

/**
 * Get all leads from Frappe CRM with optional filtering
 * @param filters - Optional query filters for search, pagination, sorting
 * @returns Promise with list of leads
 */
export const getLeadsService = async (
  filters?: LeadQueryFilters,
): Promise<ServiceResponse<Lead[]>> => {
  try {
    logger.info("Fetching leads from Frappe", { filters });

    const endpoint = "/api/resource/Lead";

    // Build query parameters
    const params: Record<string, unknown> = {
      fields: '["*"]',
    };

    // Pagination — clamped to safe bounds (max 100 per page)
    const { page, pageSize: limit } = sanitizePagination(
      filters?.page,
      filters?.pageSize,
    );
    params.limit = limit;
    params.limit_start = (page - 1) * limit;

    // Sorting — only allow whitelisted field names to prevent injection
    if (filters?.sortBy) {
      if (isAllowedSortField(filters.sortBy, "lead")) {
        const dir = filters.sortOrder === "desc" ? "desc" : "asc";
        params.order_by = `${filters.sortBy} ${dir}`;
      } else {
        logger.warn("Rejected invalid sortBy field for leads", {
          sortBy: filters.sortBy,
        });
      }
    }

    // AND filters
    const andFilters: unknown[] = [];

    if (filters?.status) {
      andFilters.push(["Lead", "status", "=", filters.status]);
    }
    if (filters?.lastName) {
      andFilters.push(["Lead", "last_name", "like", `%${filters.lastName}%`]);
    }
    if (filters?.email) {
      andFilters.push(["Lead", "email", "like", `%${filters.email}%`]);
    }
    if (filters?.phone) {
      andFilters.push(["Lead", "phone", "like", `%${filters.phone}%`]);
    }

    if (andFilters.length > 0) {
      params.filters = JSON.stringify(andFilters);
    }

    // OR filters for search across first_name, last_name, email, phone
    if (filters?.search) {
      const search = sanitizeString(filters.search, 200);
      params.or_filters = JSON.stringify([
        ["Lead", "first_name", "like", `%${search}%`],
        ["Lead", "last_name", "like", `%${search}%`],
        ["Lead", "email", "like", `%${search}%`],
        ["Lead", "phone", "like", `%${search}%`],
      ]);
    }

    const response = await frappeClient.get<Lead[]>(endpoint, params);

    return {
      success: true,
      message: `Retrieved ${Array.isArray(response) ? response.length : 0} leads`,
      data: Array.isArray(response) ? response : [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to fetch leads", { error: errorMessage, filters });

    return {
      success: false,
      message: "Failed to retrieve leads",
      error: errorMessage,
    };
  }
};
