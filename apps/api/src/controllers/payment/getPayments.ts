import { Request, Response } from "express";

export const getPaymentsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  // Controller implementation for getting all payments
  res.status(200).json({ message: "Get payments controller" });
};
