/**
 * Lead Status Enum
 *
 * Represents the current status of a lead in the sales pipeline
 */
export enum LeadStatus {
  New = "New",
  Contacted = "Contacted",
  Qualified = "Qualified",
  Unqualified = "Unqualified",
  Negotiation = "Negotiation",
  Won = "Won",
  Lost = "Lost",
  Closed = "Closed",
}

/**
 * Lead Entity
 *
 * Represents a sales lead with contact information and vehicle interest
 */
export interface Lead {
  /// Unique identifier (UUID)
  id: string;

  /// Lead's first name - mandatory
  firstName: string;

  /// Lead's last name - mandatory
  lastName: string;

  /// Lead's email address - mandatory
  email: string;

  /// Lead's phone number - mandatory
  phone: string;

  /// Vehicle description in "Color Make Model Year" format
  /// e.g. "Red Porsche 911 GT3 Touring 2023"
  vehicleProperties: string;

  /// Additional message or notes from the lead
  message: string;

  /// Lead status in the sales pipeline
  status?: LeadStatus | string;

  /// Lead source (e.g., website, referral, ad) - optional
  source?: string | null;

  /// Last contact date/time - optional
  lastContactedAt?: Date | string | null;

  /// Timestamp when the lead was created
  createdAt?: Date | string;

  /// Timestamp when the lead was last updated
  updatedAt?: Date | string;
}

/**
 * Create Lead Request DTO
 *
 * Data transfer object for creating a new lead.
 * Includes mandatory fields required to create a lead.
 */
export interface CreateLeadRequest {
  /// Lead's first name - mandatory
  firstName: string;

  /// Lead's last name - mandatory
  lastName: string;

  /// Lead's email address - mandatory
  email: string;

  /// Lead's phone number - mandatory
  phone: string;

  /// Vehicle description in "Color Make Model Year" format
  /// e.g. "Red Porsche 911 GT3 Touring 2023" - mandatory
  vehicleProperties: string;

  /// Additional message or notes from the lead - mandatory
  message: string;

  /// Lead source (e.g., website, referral, ad) - optional
  source?: string;

  /// Initial lead status - optional (defaults to "New")
  status?: LeadStatus | string;
}

/**
 * Update Lead Request DTO
 *
 * Data transfer object for updating an existing lead.
 * All fields are optional to support partial updates.
 */
export interface UpdateLeadRequest {
  /// Lead's first name
  firstName?: string;

  /// Lead's last name
  lastName?: string;

  /// Lead's email address
  email?: string;

  /// Lead's phone number
  phone?: string;

  /// Vehicle description in "Color Make Model Year" format
  /// e.g. "Red Porsche 911 GT3 Touring 2023"
  vehicleProperties?: string;

  /// Additional message or notes from the lead
  message?: string;

  /// Lead status in the sales pipeline
  status?: LeadStatus | string;

  /// Lead source
  source?: string;

  /// Last contact date/time
  lastContactedAt?: Date | string;
}

/**
 * Lead Response DTO
 *
 * Standard API response for a single lead
 */
export interface LeadResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// The lead data (populated on success)
  data?: Lead;

  /// Error message (populated on failure)
  error?: string;

  /// ISO timestamp of the response
  timestamp: string;
}

/**
 * Leads List Response DTO
 *
 * Standard API response for paginated leads list
 */
export interface LeadsListResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// Array of leads
  data: Lead[];

  /// Total number of leads matching the query
  total?: number;

  /// Current page number (1-indexed)
  page?: number;

  /// Number of items per page
  pageSize?: number;

  /// Total number of pages
  totalPages?: number;

  /// Error message (populated on failure)
  error?: string;

  /// ISO timestamp of the response
  timestamp: string;
}

/**
 * Lead Query Filters
 *
 * Filters for querying leads from the system
 */
export interface LeadQueryFilters {
  /// Filter by lead status
  status?: LeadStatus | string;

  /// Filter by lead source
  source?: string;

  /// Filter by first name (partial match)
  firstName?: string;

  /// Filter by last name (partial match)
  lastName?: string;

  /// Filter by email (partial match)
  email?: string;

  /// Filter by phone (partial match)
  phone?: string;

  /// Search term to match against firstName, lastName, email, or phone
  search?: string;

  /// Filter leads created after this date
  createdAfter?: Date | string;

  /// Filter leads created before this date
  createdBefore?: Date | string;

  /// Filter leads last contacted after this date
  lastContactedAfter?: Date | string;

  /// Sort field (e.g., 'createdAt', 'firstName', 'status')
  sortBy?: string;

  /// Sort order: 'asc' or 'desc'
  sortOrder?: "asc" | "desc";

  /// Page number for pagination (1-indexed)
  page?: number;

  /// Items per page
  pageSize?: number;
}

/**
 * Lead Update Result
 *
 * Result of a lead update operation
 */
export interface LeadUpdateResult {
  /// Whether the update was successful
  success: boolean;

  /// Updated lead data
  lead: Lead;

  /// Changes that were applied
  changes: Record<string, unknown>;
}
