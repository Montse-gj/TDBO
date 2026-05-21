import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller.ts";

const router = Router();

router.post("/", ExpenseController.createExpense);
router.get("/:groupId", ExpenseController.getExpensesByGroup);
router.delete("/:expenseId", ExpenseController.deleteExpense);

export default router;


/*
  crear gasto con curl:
  
 curl -X POST http://localhost:3000/api/expenses   -H "Content-Type: application/json"   -d '{
    "group_id": 1,
    "paid_by_user_id": 2,
    "amount": 45,
    "description": "Cena del primer día"
  }'


 */