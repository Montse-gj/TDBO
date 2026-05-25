import { Router } from "express";
import { GroupController } from "../controllers/trip.controller.ts";
import { verifyToken } from "../middlewares/authMiddleware.ts";

const router = Router();

// Todas las rutas de viajes están protegidas por token JWT
router.get("/", verifyToken, GroupController.getUserGroups);
router.post("/", verifyToken, GroupController.createGroup);

router.get("/:groupId/members", verifyToken, GroupController.getGroupMembers);
router.post("/:groupId/members", verifyToken, GroupController.addMember);
router.delete("/:groupId/members/:userId", verifyToken, GroupController.removeMember);

router.put("/:groupId", verifyToken, GroupController.updateGroup);
router.delete("/:groupId/delete", verifyToken, GroupController.deleteGroup);

export default router;