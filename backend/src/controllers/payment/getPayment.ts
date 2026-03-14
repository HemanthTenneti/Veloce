import { Request, Response } from "express";

export const getPaymentController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  // Controller implementation for getting a single payment
  res.status(200).json({ message: "Get payment controller" });
};
