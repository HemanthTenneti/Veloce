import type { ServiceResponse } from "@domain";

export const deletePaymentService = async (): Promise<ServiceResponse> => {
  // Service implementation for deleting a payment
  return {
    success: true,
    message: "Payment deleted",
  };
};
