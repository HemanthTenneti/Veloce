import { Router } from "express";
import {
  getVehicleController,
  getVehiclesController,
} from "@controllers/vehicle";

const router = Router();

// GET /api/vehicles - Get all vehicles (PUBLIC - customer browsing)
router.get("/", getVehiclesController);

// GET /api/vehicles/:id - Get a specific vehicle (PUBLIC - customer viewing details)
router.get("/:id", getVehicleController);

export default router;
