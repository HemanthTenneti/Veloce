import { Request, Response } from "express";

export const createPaymentController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  // Controller implementation for creating a payment
  res.status(201).json({ message: "Create payment controller" });
};
