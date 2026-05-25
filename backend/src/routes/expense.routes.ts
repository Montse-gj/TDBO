import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller.ts";
import { verifyToken } from "../middlewares/authMiddleware.ts";

const router = Router();

// Todas las rutas de gastos requieren autenticación mediante token JWT
router.get("/group/:groupId/balances", verifyToken, ExpenseController.getGroupBalances);

router.post("/", verifyToken, ExpenseController.createExpense);
router.get("/:groupId", verifyToken, ExpenseController.getExpensesByGroup);
router.put("/:expenseId", verifyToken, ExpenseController.updateExpense);
router.delete("/:expenseId", verifyToken, ExpenseController.deleteExpense);

export default router;