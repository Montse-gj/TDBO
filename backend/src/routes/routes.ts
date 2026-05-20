import { Router } from "express";
import userRoutes from "./user.routes.ts";
import authRoutes from "./auth.routes.ts";
import tripRoutes from "./trip.routes.ts";
import expenseRoutes from "./expense.routes.ts";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
    router.use("/trips", tripRoutes);
router.use("/expenses", expenseRoutes);

export default router;