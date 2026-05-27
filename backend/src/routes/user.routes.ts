import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { verifyToken } from "../middlewares/authMiddleware.ts";

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado, token faltante o inválido
 */
router.get("/profile", verifyToken, UserController.getProfile);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios por nombre o email
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *     responses:
 *       200:
 *         description: Lista de usuarios que coinciden
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Parámetro query inválido
 */
router.get("/search", verifyToken, UserController.searchUsers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", verifyToken, UserController.listUsers);

export default router;