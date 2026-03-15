/**
 * Vehicle Inventory Status Enum
 */
export enum VehicleStatus {
  Available = "Available",
  Sold = "Sold",
  Reserved = "Reserved",
  Maintenance = "Maintenance",
  Inactive = "Inactive",
}

export interface VehicleMediaFields {
  /// Primary image used for listing cards and initial hydration
  thumbnail: string;

  /// Optional supporting vehicle image URL
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  image7?: string | null;
  image8?: string | null;
  image9?: string | null;
  image10?: string | null;
}

/**
 * Vehicle Inventory Entity
 *
 * Represents a vehicle in the inventory system with complete details
 */
export interface Vehicle extends VehicleMediaFields {
  /// Unique identifier (UUID)
  id: string;

  /// Vehicle Identification Number (VIN) - optional
  vin?: string | null;

  /// Vehicle manufacturer/brand - mandatory
  make: string;

  /// Vehicle model name - mandatory
  model: string;

  /// Manufacturing year - mandatory
  year: number;

  /// Vehicle color - mandatory
  color: string;

  /// Current mileage/odometer reading - optional
  mileage?: number | null;

  /// Vehicle selling price - optional
  price?: number | null;

  /// Detailed description of the vehicle - optional
  description?: string | null;

  /// Current status of the vehicle - mandatory
  status: VehicleStatus | string;

  /// Timestamp when the vehicle was added to inventory
  createdAt?: Date | string;

  /// Timestamp when the vehicle was last updated
  updatedAt?: Date | string;
}

/**
 * Create Vehicle Request DTO
 *
 * Data transfer object for creating a new vehicle.
 * Only includes mandatory and optional fields that can be provided during creation.
 */
export interface CreateVehicleRequest extends VehicleMediaFields {
  /// Vehicle manufacturer/brand - mandatory
  make: string;

  /// Vehicle model name - mandatory
  model: string;

  /// Manufacturing year - mandatory
  year: number;

  /// Vehicle color - mandatory
  color: string;

  /// Current status - mandatory
  status: VehicleStatus | string;

  /// Vehicle Identification Number (VIN) - optional
  vin?: string;

  /// Current mileage/odometer reading - optional
  mileage?: number;

  /// Vehicle selling price - optional
  price?: number;

  /// Detailed description of the vehicle - optional
  description?: string;
}

/**
 * Update Vehicle Request DTO
 *
 * Data transfer object for updating an existing vehicle.
 * All fields are optional to support partial updates.
 */
export interface UpdateVehicleRequest {
  /// Vehicle manufacturer/brand
  make?: string;

  /// Vehicle model name
  model?: string;

  /// Manufacturing year
  year?: number;

  /// Vehicle color
  color?: string;

  /// Vehicle Identification Number (VIN)
  vin?: string;

  /// Current mileage/odometer reading
  mileage?: number;

  /// Vehicle selling price
  price?: number;

  /// Detailed description of the vehicle
  description?: string;

  /// Primary image used for listing cards and initial hydration
  thumbnail?: string;

  /// Optional supporting vehicle image URLs
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  image7?: string;
  image8?: string;
  image9?: string;
  image10?: string;

  /// Current status of the vehicle
  status?: VehicleStatus | string;
}

/**
 * Vehicle Response DTO
 *
 * Standard API response for a single vehicle
 */
export interface VehicleResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// The vehicle data (populated on success)
  data?: Vehicle;

  /// Error message (populated on failure)
  error?: string;

  /// ISO timestamp of the response
  timestamp: string;
}

/**
 * Vehicles List Response DTO
 *
 * Standard API response for paginated vehicles list
 */
export interface VehiclesListResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// Array of vehicles
  data: Vehicle[];

  /// Total number of vehicles matching the query
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
 * Vehicle Query Filters
 *
 * Filters for querying vehicles from the inventory
 */
export interface VehicleQueryFilters {
  /// Filter by vehicle status
  status?: VehicleStatus | string;

  /// Filter by minimum year
  minYear?: number;

  /// Filter by maximum year
  maxYear?: number;

  /// Filter by vehicle make/manufacturer
  make?: string;

  /// Filter by vehicle model
  model?: string;

  /// Filter by minimum price
  minPrice?: number;

  /// Filter by maximum price
  maxPrice?: number;

  /// Filter by minimum mileage
  minMileage?: number;

  /// Filter by maximum mileage
  maxMileage?: number;

  /// Search term to match against make, model, or description
  search?: string;

  /// Sort field (e.g., 'year', 'price', 'createdAt')
  sortBy?: string;

  /// Sort order: 'asc' or 'desc'
  sortOrder?: "asc" | "desc";

  /// Page number for pagination (1-indexed)
  page?: number;

  /// Items per page
  pageSize?: number;
}

/**
 * Vehicle Update Result
 *
 * Result of a vehicle update operation
 */
export interface VehicleUpdateResult {
  /// Whether the update was successful
  success: boolean;

  /// Updated vehicle data
  vehicle: Vehicle;

  /// Changes that were applied
  changes: Record<string, unknown>;
}
