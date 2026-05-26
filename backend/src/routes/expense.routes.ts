import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller.ts";
import { verifyToken, verifyGroupMembership } from "../middlewares/authMiddleware.ts";

const router = Router();

/**
 * @swagger
 * /expenses/group/{groupId}/balances:
 *   get:
 *     summary: Obtener balances y deudas del grupo
 *     tags: [Gastos]
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
 *         description: Balances del grupo con sugerencias de transferencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group_id:
 *                   type: integer
 *                 total_group_spent:
 *                   type: number
 *                 share_per_member:
 *                   type: number
 *                 member_balances:
 *                   type: array
 *                   items:
 *                     type: object
 *                 suggested_transfers:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Grupo no existe o no tiene miembros
 */
router.get("/group/:groupId/balances", verifyToken, verifyGroupMembership, ExpenseController.getGroupBalances);

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Crear nuevo gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *               - amount
 *               - description
 *             properties:
 *               group_id:
 *                 type: integer
 *               paid_by_user_id:
 *                 type: integer
 *                 description: Por defecto es el usuario autenticado
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date
 *               split_type:
 *                 type: string
 *                 enum: [equal, custom]
 *                 default: equal
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                 description: Requerido si split_type es custom
 *     responses:
 *       201:
 *         description: Gasto creado con éxito
 *       400:
 *         description: Campos obligatorios faltantes o splits inválidos
 *       404:
 *         description: Grupo o usuario no encontrado
 *       403:
 *         description: No eres miembro del grupo
 */
router.post("/", verifyToken, ExpenseController.createExpense);

/**
 * @swagger
 * /expenses/{groupId}:
 *   get:
 *     summary: Obtener todos los gastos de un grupo
 *     tags: [Gastos]
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
 *         description: Lista de gastos del grupo
 *       403:
 *         description: No eres miembro del grupo
 */
router.get("/:groupId", verifyToken, verifyGroupMembership, ExpenseController.getExpensesByGroup);

/**
 * @swagger
 * /expenses/{expenseId}:
 *   put:
 *     summary: Actualizar un gasto (recalcula splits automáticamente)
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               paid_by_user_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               split_type:
 *                 type: string
 *                 enum: [equal, custom]
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Gasto actualizado con éxito
 *       404:
 *         description: Gasto no encontrado
 *       403:
 *         description: No tienes permiso para modificar este gasto
 */
router.put("/:expenseId", verifyToken, ExpenseController.updateExpense);

/**
 * @swagger
 * /expenses/{expenseId}:
 *   delete:
 *     summary: Eliminar un gasto (y sus splits)
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto eliminado con éxito
 *       404:
 *         description: Gasto no encontrado
 *       403:
 *         description: No tienes permiso para eliminar este gasto
 */
router.delete("/:expenseId", verifyToken, ExpenseController.deleteExpense);

export default router;