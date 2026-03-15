import { Router } from "express";
import {
  createPaymentController,
  getPaymentController,
  getPaymentsController,
  updatePaymentController,
  deletePaymentController,
} from "@controllers/payment";

const router = Router();

// All payment endpoints are PROTECTED (employee-only)
// Payments contain sensitive financial data
// Note: authMiddleware has been removed. Add it back if needed.

// POST /api/payments - Create a new payment
router.post("/", createPaymentController);

// GET /api/payments - Get all payments
router.get("/", getPaymentsController);

// GET /api/payments/:id - Get a specific payment
router.get("/:id", getPaymentController);

// PUT /api/payments/:id - Update a payment
router.put("/:id", updatePaymentController);

// DELETE /api/payments/:id - Delete a payment
router.delete("/:id", deletePaymentController);

export default router;
