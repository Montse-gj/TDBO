import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { verifyToken } from "../middlewares/authMiddleware.ts";

const router = Router();

// Todas las rutas de usuario requieren autenticación por token
router.get("/profile", verifyToken, UserController.getProfile);
router.get("/search", verifyToken, UserController.searchUsers);
router.get("/", verifyToken, UserController.listUsers);

export default router;
