/**
 * Payment Status Enum
 *
 * Represents the status of a payment transaction
 */
export enum PaymentStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
  Refunded = "Refunded",
  Cancelled = "Cancelled",
}

/**
 * Payment Currency Enum
 *
 * Supported currencies for payment processing
 */
export enum PaymentCurrency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  INR = "INR",
  AUD = "AUD",
  CAD = "CAD",
  JPY = "JPY",
}

/**
 * Payment Payment Method Enum
 *
 * Supported payment methods
 */
export enum PaymentMethod {
  CreditCard = "CreditCard",
  DebitCard = "DebitCard",
  BankTransfer = "BankTransfer",
  Cryptocurrency = "Cryptocurrency",
  PayPal = "PayPal",
  ApplePay = "ApplePay",
  GooglePay = "GooglePay",
}

/**
 * Payment Entity
 *
 * Represents a payment transaction for a vehicle purchase
 */
export interface Payment {
  /// Unique identifier (UUID)
  id: string;

  /// ID of the vehicle being purchased - mandatory
  vehicleId: string;

  /// ID of the lead/customer making payment - mandatory
  leadId: string;

  /// Payment amount in the specified currency - mandatory
  amount: number;

  /// Currency of the payment - mandatory
  currency: PaymentCurrency | string;

  /// Current status of the payment - mandatory
  paymentStatus: PaymentStatus | string;

  /// Payment method used - mandatory
  paymentMethod: PaymentMethod | string;

  /// Payment link/URL for customer to complete payment
  paymentLink: string;

  /// Transaction ID from payment gateway - optional
  transactionId?: string | null;

  /// Reason for payment failure (if applicable) - optional
  failureReason?: string | null;

  /// Reference number for the payment - optional
  referenceNumber?: string | null;

  /// Timestamp when payment was initiated
  createdAt?: Date | string;

  /// Timestamp when payment was last updated
  updatedAt?: Date | string;
}

/**
 * Create Payment Request DTO
 *
 * Data transfer object for creating a new payment.
 * Includes mandatory fields required to initiate payment.
 */
export interface CreatePaymentRequest {
  /// ID of the vehicle being purchased - mandatory
  vehicleId: string;

  /// ID of the lead/customer making payment - mandatory
  leadId: string;

  /// Payment amount in the specified currency - mandatory
  amount: number;

  /// Currency of the payment - mandatory
  currency: PaymentCurrency | string;

  /// Payment method to use - mandatory
  paymentMethod: PaymentMethod | string;

  /// Optional reference number
  referenceNumber?: string;

  /// Initial payment status - optional (defaults to "Pending")
  paymentStatus?: PaymentStatus | string;
}

/**
 * Update Payment Request DTO
 *
 * Data transfer object for updating an existing payment.
 * All fields are optional to support partial updates.
 */
export interface UpdatePaymentRequest {
  /// Payment amount
  amount?: number;

  /// Currency of the payment
  currency?: PaymentCurrency | string;

  /// Current status of the payment
  paymentStatus?: PaymentStatus | string;

  /// Payment method used
  paymentMethod?: PaymentMethod | string;

  /// Transaction ID from payment gateway
  transactionId?: string;

  /// Reason for payment failure
  failureReason?: string;

  /// Reference number for the payment
  referenceNumber?: string;

  /// Payment link/URL
  paymentLink?: string;
}

/**
 * Payment Response DTO
 *
 * Standard API response for a single payment
 */
export interface PaymentResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// The payment data (populated on success)
  data?: Payment;

  /// Error message (populated on failure)
  error?: string;

  /// ISO timestamp of the response
  timestamp: string;
}

/**
 * Payments List Response DTO
 *
 * Standard API response for paginated payments list
 */
export interface PaymentsListResponse {
  /// Whether the operation was successful
  success: boolean;

  /// Human-readable message about the operation
  message: string;

  /// Array of payments
  data: Payment[];

  /// Total number of payments matching the query
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
 * Payment Query Filters
 *
 * Filters for querying payments from the system
 */
export interface PaymentQueryFilters {
  /// Filter by payment status
  paymentStatus?: PaymentStatus | string;

  /// Filter by vehicle ID
  vehicleId?: string;

  /// Filter by lead ID
  leadId?: string;

  /// Filter by currency
  currency?: PaymentCurrency | string;

  /// Filter by payment method
  paymentMethod?: PaymentMethod | string;

  /// Filter by minimum amount
  minAmount?: number;

  /// Filter by maximum amount
  maxAmount?: number;

  /// Filter by transaction ID
  transactionId?: string;

  /// Filter by reference number
  referenceNumber?: string;

  /// Filter payments created after this date
  createdAfter?: Date | string;

  /// Filter payments created before this date
  createdBefore?: Date | string;

  /// Search term to match against reference or transaction ID
  search?: string;

  /// Sort field (e.g., 'createdAt', 'amount', 'paymentStatus')
  sortBy?: string;

  /// Sort order: 'asc' or 'desc'
  sortOrder?: "asc" | "desc";

  /// Page number for pagination (1-indexed)
  page?: number;

  /// Items per page
  pageSize?: number;
}

/**
 * Payment Update Result
 *
 * Result of a payment update operation
 */
export interface PaymentUpdateResult {
  /// Whether the update was successful
  success: boolean;

  /// Updated payment data
  payment: Payment;

  /// Changes that were applied
  changes: Record<string, unknown>;
}
