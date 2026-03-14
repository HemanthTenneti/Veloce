import type { ServiceResponse } from "@domain";

export const getPaymentsService = async (): Promise<ServiceResponse> => {
  // Service implementation for getting all payments
  return {
    success: true,
    message: "Payments retrieved",
  };
};
