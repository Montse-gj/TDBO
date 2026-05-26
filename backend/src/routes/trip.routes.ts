import { Router } from "express";
import { GroupController } from "../controllers/trip.controller.ts";
import { verifyToken, verifyGroupMembership } from "../middlewares/authMiddleware.ts";

const router = Router();

// Ruta pública para obtener información del viaje (usada en invitaciones)
router.get("/:groupId/public-info", GroupController.getPublicInfo);

// Todas las rutas de viajes están protegidas por token JWT
router.get("/", verifyToken, GroupController.getUserGroups);
router.post("/", verifyToken, GroupController.createGroup);

router.get("/:groupId/members", verifyToken, verifyGroupMembership, GroupController.getGroupMembers);
router.post("/:groupId/join", verifyToken, GroupController.joinGroup);
router.post("/:groupId/members", verifyToken, verifyGroupMembership, GroupController.addMember);
router.delete("/:groupId/members/:userId", verifyToken, verifyGroupMembership, GroupController.removeMember);

router.put("/:groupId", verifyToken, verifyGroupMembership, GroupController.updateGroup);
router.delete("/:groupId/delete", verifyToken, verifyGroupMembership, GroupController.deleteGroup);

export default router;