import { Router } from "express";
import { GroupController } from "../controllers/trip.controller.ts";
import { verifyToken, verifyGroupMembership } from "../middlewares/authMiddleware.ts";

const router = Router();

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Obtener todos los grupos del usuario autenticado
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: No autorizado
 */
router.get("/", verifyToken, GroupController.getUserGroups);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Crear nuevo grupo de viaje
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *             properties:
 *               group_name:
 *                 type: string
 *                 example: Viaje a Canarias
 *               trip_starts:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               trip_ends:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-01
 *     responses:
 *       201:
 *         description: Grupo creado con éxito
 *       400:
 *         description: Nombre del grupo obligatorio
 */
router.post("/", verifyToken, GroupController.createGroup);

/**
 * @swagger
 * /trips/{groupId}/members:
 *   get:
 *     summary: Obtener miembros de un grupo
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Lista de miembros del grupo
 *       404:
 *         description: Grupo no encontrado
 *       403:
 *         description: No eres miembro del grupo
 */
router.get("/:groupId/members", verifyToken, verifyGroupMembership, GroupController.getGroupMembers);

/**
 * @swagger
 * /trips/{groupId}/members:
 *   post:
 *     summary: Añadir un miembro al grupo
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Miembro añadido con éxito
 *       400:
 *         description: Usuario ya es miembro
 *       404:
 *         description: Usuario o grupo no encontrado
 */
router.post("/:groupId/members", verifyToken, verifyGroupMembership, GroupController.addMember);

/**
 * @swagger
 * /trips/{groupId}/members/{userId}:
 *   delete:
 *     summary: Eliminar un miembro del grupo
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Miembro eliminado con éxito
 *       404:
 *         description: Relación de miembro no existe
 */
router.delete("/:groupId/members/:userId", verifyToken, verifyGroupMembership, GroupController.removeMember);

/**
 * @swagger
 * /trips/{groupId}:
 *   put:
 *     summary: Actualizar información del grupo
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               trip_starts:
 *                 type: string
 *                 format: date
 *               trip_ends:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Grupo actualizado con éxito
 *       404:
 *         description: Grupo no encontrado
 */
router.put("/:groupId", verifyToken, verifyGroupMembership, GroupController.updateGroup);

/**
 * @swagger
 * /trips/{groupId}/delete:
 *   delete:
 *     summary: Eliminar un grupo (y sus miembros y gastos)
 *     tags: [Viajes/Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Grupo eliminado con éxito
 *       404:
 *         description: Grupo no encontrado
 */
router.delete("/:groupId/delete", verifyToken, verifyGroupMembership, GroupController.deleteGroup);

export default router;