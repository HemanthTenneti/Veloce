import { Request, Response } from "express";

export const deletePaymentController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  // Controller implementation for deleting a payment
  res.status(200).json({ message: "Delete payment controller" });
};
