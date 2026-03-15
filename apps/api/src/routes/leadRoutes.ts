import { Router } from "express";
import { createLeadController } from "@controllers/lead";

const router = Router();

// POST /api/leads - Create a new lead from customer enquiry form (PUBLIC)
router.post("/", createLeadController);

export default router;
