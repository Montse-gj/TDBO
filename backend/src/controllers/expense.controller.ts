import type { Request, Response } from "express";
import db from "../models/index.ts";

export const ExpenseController = {
    createExpense: async (req: Request, res: Response): Promise<any> => {
        try {
            const { expense_id, group_id, paid_by_user_id, amount, description, created_at } = req.body;

            if (!group_id || !paid_by_user_id || !amount || !description) {
                return res.status(400).json({
                    error: "group_id, paid_by_user_id, amount y description son obligatorios"
                });
            }

            const groupExists = await db.Group.findOne({ where: { group_id } });
            if (!groupExists) {
                return res.status(404).json({ error: "El grupo no existe" });
            }

            const userExists = await db.User.findOne({ where: { user_id: paid_by_user_id } });
            if (!userExists) {
                return res.status(404).json({ error: "El usuario no existe" });
            }

            const newExpense = await db.Expense.create({
                expense_id,
                group_id,
                paid_by_user_id,
                amount,
                description,
                created_at
            });

            return res.status(201).json({
                message: "Gasto creado con éxito",
                expense: newExpense
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error del servidor al crear el gasto" });
        }
    },

    getExpensesByGroup: async (req: Request, res: Response): Promise<any> => {
        try {
            const { groupId } = req.params;

            const expenses = await db.Expense.findAll({
                where: { group_id: groupId },
                include: [
                    {
                        model: db.User,
                        as: "paidByUser"
                    },
                    {
                        model: db.Group,
                        as: "groupExpense"
                    }
                ],
                order: [["created_at", "DESC"]]
            });

            return res.status(200).json(expenses);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error del servidor al obtener los gastos" });
        }
    },
    updateExpense: async (req: Request, res: Response): Promise<any> => {
        try {
            const { expenseId } = req.params;
            const { group_id, paid_by_user_id, amount, description, created_at } = req.body;

            const expense = await db.Expense.findOne({
                where: { expense_id: expenseId }
            });

            if (!expense) {
                return res.status(404).json({ error: "Gasto no encontrado" });
            }

            if (group_id) {
                const groupExists = await db.Group.findOne({ where: { group_id } });
                if (!groupExists) {
                    return res.status(404).json({ error: "El grupo no existe" });
                }
            }

            if (paid_by_user_id) {
                const userExists = await db.User.findOne({ where: { user_id: paid_by_user_id } });
                if (!userExists) {
                    return res.status(404).json({ error: "El usuario no existe" });
                }
            }

            await expense.update({
                group_id: group_id ?? expense.group_id,
                paid_by_user_id: paid_by_user_id ?? expense.paid_by_user_id,
                amount: amount ?? expense.amount,
                description: description ?? expense.description,
                created_at: created_at ?? expense.created_at
            });

            return res.status(200).json({
                message: "Gasto actualizado con éxito",
                expense
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error del servidor al actualizar el gasto" });
        }
    },

    deleteExpense: async (req: Request, res: Response): Promise<any> => {
        try {
            const { expenseId } = req.params;

            const deleted = await db.Expense.destroy({
                where: { expense_id: expenseId }
            });

            if (!deleted) {
                return res.status(404).json({ error: "Gasto no encontrado" });
            }

            return res.status(200).json({ message: "Gasto eliminado con éxito" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error del servidor al borrar el gasto" });
        }
    }
};