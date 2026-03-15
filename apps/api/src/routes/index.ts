import { Router } from "express";
import vehicleRoutes from "./vehicleRoutes.js";
import leadRoutes from "./leadRoutes.js";

const router = Router();

// Mount entity routes
router.use("/vehicles", vehicleRoutes);
router.use("/leads", leadRoutes);

export default router;
