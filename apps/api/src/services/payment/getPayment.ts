import type { ServiceResponse } from "@domain";

export const getPaymentService = async (): Promise<ServiceResponse> => {
  // Service implementation for getting a single payment
  return {
    success: true,
    message: "Payment retrieved",
  };
};
