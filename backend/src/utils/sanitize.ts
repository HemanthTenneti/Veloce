/**
 * Input sanitization and validation utilities for security
 */

// Allowed sort fields per entity to prevent arbitrary column injection
const VEHICLE_SORT_FIELDS = new Set([
  "name",
  "make",
  "model",
  "year",
  "price",
  "mileage",
  "status",
  "creation",
  "modified",
]);

const LEAD_SORT_FIELDS = new Set([
  "name",
  "first_name",
  "last_name",
  "email",
  "status",
  "source",
  "creation",
  "modified",
]);

/**
 * Validate that a sort field is in the allowed whitelist for the given entity
 */
export const isAllowedSortField = (
  field: string,
  entity: "vehicle" | "lead",
): boolean => {
  const allowedFields =
    entity === "vehicle" ? VEHICLE_SORT_FIELDS : LEAD_SORT_FIELDS;
  return allowedFields.has(field);
};

/**
 * Clamp pagination values to safe bounds
 */
export const sanitizePagination = (
  page?: number,
  pageSize?: number,
): { page: number; pageSize: number } => {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize || 20)));
  return { page: safePage, pageSize: safePageSize };
};

/**
 * Basic email format validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize a string by trimming whitespace and limiting length
 */
export const sanitizeString = (
  value: string,
  maxLength: number = 500,
): string => {
  return value.trim().slice(0, maxLength);
};
