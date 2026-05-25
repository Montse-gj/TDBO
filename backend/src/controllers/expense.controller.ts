import type { Response } from "express";
import db from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

export const ExpenseController = {
  // Crear un nuevo gasto
  createExpense: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { group_id, paid_by_user_id, amount, description, created_at } = req.body;
      const loggedInUserId = req.user?.id;

      // El pagador por defecto será el usuario autenticado si no se proporciona uno
      const payerId = paid_by_user_id || loggedInUserId;

      if (!group_id || !payerId || !amount || !description) {
        return res.status(400).json({
          error: "group_id, amount y description son obligatorios"
        });
      }

      // Validar si el grupo existe
      const groupExists = await db.Group.findOne({ where: { group_id } });
      if (!groupExists) {
        return res.status(404).json({ error: "El grupo no existe" });
      }

      // Validar si el usuario que realiza la petición pertenece al grupo
      const isCreatorMember = await db.GroupMembers.findOne({
        where: { group_id, user_id: loggedInUserId }
      });
      if (!isCreatorMember) {
        return res.status(403).json({ error: "Acceso denegado. No eres miembro de este grupo de viaje." });
      }

      // Validar si el usuario pagador existe
      const userExists = await db.User.findOne({ where: { user_id: payerId } });
      if (!userExists) {
        return res.status(404).json({ error: "El usuario pagador no existe" });
      }

      // Validar si el pagador es miembro del grupo
      const isMember = await db.GroupMembers.findOne({
        where: { group_id, user_id: payerId }
      });
      if (!isMember) {
        return res.status(400).json({ error: "El usuario que pagó no es miembro de este grupo de viaje" });
      }

      // Crear el gasto (sin expense_id manual)
      const newExpense = await db.Expense.create({
        group_id,
        paid_by_user_id: payerId,
        amount: Number(amount),
        description,
        created_at: created_at || new Date()
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

  // Obtener los gastos asociados a un grupo
  getExpensesByGroup: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      const expenses = await db.Expense.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: db.User,
            as: "paidByUser",
            attributes: ["user_id", "user_name", "user_email"]
          },
          {
            model: db.Group,
            as: "groupExpense",
            attributes: ["group_id", "group_name"]
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

  // Actualizar un gasto
  updateExpense: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { expenseId } = req.params;
      const { group_id, paid_by_user_id, amount, description, created_at } = req.body;
      const loggedInUserId = req.user?.id;

      const expense = await db.Expense.findOne({
        where: { expense_id: expenseId }
      });

      if (!expense) {
        return res.status(404).json({ error: "Gasto no encontrado" });
      }

      // Verificar que el usuario pertenece al grupo actual del gasto
      const isMember = await db.GroupMembers.findOne({
        where: { group_id: expense.group_id, user_id: loggedInUserId }
      });
      if (!isMember) {
        return res.status(403).json({ error: "No tienes permiso para modificar este gasto." });
      }

      if (group_id) {
        const groupExists = await db.Group.findOne({ where: { group_id } });
        if (!groupExists) {
          return res.status(404).json({ error: "El grupo no existe" });
        }

        // Verificar membresía en el nuevo grupo
        const isMemberOfNewGroup = await db.GroupMembers.findOne({
          where: { group_id, user_id: loggedInUserId }
        });
        if (!isMemberOfNewGroup) {
          return res.status(403).json({ error: "No tienes permiso para mover este gasto a ese grupo." });
        }
      }

      if (paid_by_user_id) {
        const userExists = await db.User.findOne({ where: { user_id: paid_by_user_id } });
        if (!userExists) {
          return res.status(404).json({ error: "El usuario no existe" });
        }

        // Verificar que el pagador pertenece al grupo (nuevo o actual)
        const targetGroupId = group_id || expense.group_id;
        const isPayerMember = await db.GroupMembers.findOne({
          where: { group_id: targetGroupId, user_id: paid_by_user_id }
        });
        if (!isPayerMember) {
          return res.status(400).json({ error: "El usuario pagador no es miembro del grupo." });
        }
      }

      await expense.update({
        group_id: group_id ?? expense.group_id,
        paid_by_user_id: paid_by_user_id ?? expense.paid_by_user_id,
        amount: amount ? Number(amount) : expense.amount,
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

  // Borrar un gasto
  deleteExpense: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { expenseId } = req.params;
      const loggedInUserId = req.user?.id;

      const expense = await db.Expense.findOne({
        where: { expense_id: expenseId }
      });

      if (!expense) {
        return res.status(404).json({ error: "Gasto no encontrado" });
      }

      // Verificar que el usuario pertenece al grupo del gasto
      const isMember = await db.GroupMembers.findOne({
        where: { group_id: expense.group_id, user_id: loggedInUserId }
      });
      if (!isMember) {
        return res.status(403).json({ error: "No tienes permiso para borrar este gasto." });
      }

      await expense.destroy();

      return res.status(200).json({ message: "Gasto eliminado con éxito" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al borrar el gasto" });
    }
  },

  // Cálculo de balances y deudas inteligente ("Te Debo O Me Debes")
  getGroupBalances: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      // 1. Obtener todos los miembros del grupo
      const memberships = await db.GroupMembers.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["user_id", "user_name", "user_email"]
          }
        ]
      });

      if (memberships.length === 0) {
        return res.status(404).json({ error: "El grupo no existe o no tiene miembros." });
      }

      const members = memberships.map((m: any) => m.user);
      const numMembers = members.length;

      // 2. Obtener todos los gastos de este grupo
      const expenses = await db.Expense.findAll({
        where: { group_id: groupId }
      });

      // 3. Calcular el total gastado
      const totalAmount = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

      // 4. Calcular la cuota por persona
      const sharePerMember = numMembers > 0 ? Number((totalAmount / numMembers).toFixed(2)) : 0;

      // 5. Inicializar mapas para calcular cuánto pagó cada uno
      const totalPaidByUser: Record<number, number> = {};
      members.forEach((m: any) => {
        totalPaidByUser[m.user_id] = 0;
      });

      expenses.forEach((exp: any) => {
        const payerId = exp.paid_by_user_id;
        if (totalPaidByUser[payerId] !== undefined) {
          totalPaidByUser[payerId] += Number(exp.amount);
        }
      });

      // 6. Construir lista de balances individuales (Monto pagado - Cuota)
      const userBalances = members.map((m: any) => {
        const paid = totalPaidByUser[m.user_id] || 0;
        const balance = Number((paid - sharePerMember).toFixed(2));
        return {
          user_id: m.user_id,
          user_name: m.user_name,
          user_email: m.user_email,
          total_paid: paid,
          share: sharePerMember,
          net_balance: balance
        };
      });

      // 7. Algoritmo de Simplificación de Deudas
      // Dividimos en acreedores (tienen saldo positivo) y deudores (tienen saldo negativo)
      const creditors = userBalances
        .filter((u) => u.net_balance > 0.01)
        .map((u) => ({ ...u }));
      const debtors = userBalances
        .filter((u) => u.net_balance < -0.01)
        .map((u) => ({ ...u }));

      const suggestedTransfers: Array<{
        from_user_id: number;
        from_user_name: string;
        to_user_id: number;
        to_user_name: string;
        amount: number;
      }> = [];

      let cIndex = 0;
      let dIndex = 0;

      while (cIndex < creditors.length && dIndex < debtors.length) {
        const creditor = creditors[cIndex];
        const debtor = debtors[dIndex];

        // El deudor tiene balance negativo, por lo que su deuda es -debtor.net_balance
        const creditorOwed = creditor.net_balance;
        const debtorOwes = -debtor.net_balance;

        const transferAmount = Number(Math.min(creditorOwed, debtorOwes).toFixed(2));

        suggestedTransfers.push({
          from_user_id: debtor.user_id,
          from_user_name: debtor.user_name,
          to_user_id: creditor.user_id,
          to_user_name: creditor.user_name,
          amount: transferAmount
        });

        // Actualizamos los balances de los temporales
        creditor.net_balance = Number((creditor.net_balance - transferAmount).toFixed(2));
        debtor.net_balance = Number((debtor.net_balance + transferAmount).toFixed(2));

        if (Math.abs(creditor.net_balance) < 0.01) {
          cIndex++;
        }
        if (Math.abs(debtor.net_balance) < 0.01) {
          dIndex++;
        }
      }

      return res.status(200).json({
        group_id: Number(groupId),
        total_group_spent: totalAmount,
        number_of_members: numMembers,
        share_per_member: sharePerMember,
        member_balances: userBalances,
        suggested_transfers: suggestedTransfers
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al obtener el balance de cuentas" });
    }
  }
};