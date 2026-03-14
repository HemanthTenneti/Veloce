import { Router } from "express";
import vehicleRoutes from "./vehicleRoutes";
import leadRoutes from "./leadRoutes";

const router = Router();

// Mount entity routes
router.use("/vehicles", vehicleRoutes);
router.use("/leads", leadRoutes);

export default router;
