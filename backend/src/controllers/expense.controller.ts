import type { Response } from "express";
import db from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

export const ExpenseController = {
  // Crear un nuevo gasto
  createExpense: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const {
        group_id,
        paid_by_user_id,
        amount,
        description,
        created_at,
        split_type,
        splits,
      } = req.body;
      const loggedInUserId = req.user?.id;

      // El pagador por defecto será el usuario autenticado si no se proporciona uno
      const payerId = paid_by_user_id || loggedInUserId;

      if (!group_id || !payerId || !amount || !description) {
        return res.status(400).json({
          error: "group_id, amount y description son obligatorios",
        });
      }

      const resolvedSplitType: "equal" | "custom" =
        split_type === "custom" ? "custom" : "equal";

      // Validar si el grupo existe
      const groupExists = await db.Group.findOne({ where: { group_id } });
      if (!groupExists) {
        return res.status(404).json({ error: "El grupo no existe" });
      }

      // Validar si el usuario que realiza la petición pertenece al grupo
      const isCreatorMember = await db.GroupMembers.findOne({
        where: { group_id, user_id: loggedInUserId },
      });
      if (!isCreatorMember) {
        return res.status(403).json({
          error: "Acceso denegado. No eres miembro de este grupo de viaje.",
        });
      }

      // Validar si el usuario pagador existe
      const userExists = await db.User.findOne({ where: { user_id: payerId } });
      if (!userExists) {
        return res.status(404).json({ error: "El usuario pagador no existe" });
      }

      // Validar si el pagador es miembro del grupo
      const isMember = await db.GroupMembers.findOne({
        where: { group_id, user_id: payerId },
      });
      if (!isMember) {
        return res.status(400).json({
          error: "El usuario que pagó no es miembro de este grupo de viaje",
        });
      }

      // Obtener todos los miembros del grupo para calcular los splits
      const memberships = await db.GroupMembers.findAll({
        where: { group_id },
      });
      const memberIds: number[] = memberships.map((m: any) =>
        Number(m.user_id),
      );

      const totalAmount = Number(amount);
      let splitData: { user_id: number; amount: number }[] = [];

      if (resolvedSplitType === "equal") {
        // División igual entre todos los miembros
        const share = Number((totalAmount / memberIds.length).toFixed(2));
        // Ajuste de céntimos al último miembro para evitar diferencias de redondeo
        const totalRounded = share * (memberIds.length - 1);
        const lastShare = Number((totalAmount - totalRounded).toFixed(2));
        splitData = memberIds.map((uid, idx) => ({
          user_id: uid,
          amount: idx === memberIds.length - 1 ? lastShare : share,
        }));
      } else {
        // División personalizada: validar que splits está presente y suma el total
        if (!splits || !Array.isArray(splits) || splits.length === 0) {
          return res.status(400).json({
            error:
              "Debes proporcionar el desglose de partes (splits) para el modo personalizado.",
          });
        }

        // Verificar que todos los user_id en splits son miembros del grupo
        for (const s of splits) {
          if (!memberIds.includes(Number(s.user_id))) {
            return res.status(400).json({
              error: `El usuario ${s.user_id} no es miembro del grupo.`,
            });
          }
        }

        const splitsSum = splits.reduce(
          (acc: number, s: any) => acc + Number(s.amount),
          0,
        );
        if (Math.abs(splitsSum - totalAmount) > 0.02) {
          return res.status(400).json({
            error: `La suma de las partes (${splitsSum.toFixed(2)}€) no coincide con el importe total (${totalAmount.toFixed(2)}€).`,
          });
        }

        splitData = splits.map((s: any) => ({
          user_id: Number(s.user_id),
          amount: Number(Number(s.amount).toFixed(2)),
        }));
      }

      // Crear el gasto
      const newExpense = await db.Expense.create({
        group_id,
        paid_by_user_id: payerId,
        amount: totalAmount,
        description,
        created_at: created_at || new Date(),
      });

      // Crear los splits asociados
      const splitRecords = splitData.map((s) => ({
        expense_id: newExpense.expense_id,
        user_id: s.user_id,
        amount: s.amount,
      }));
      await db.ExpenseSplit.bulkCreate(splitRecords);

      return res.status(201).json({
        message: "Gasto creado con éxito",
        expense: newExpense,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error del servidor al crear el gasto" });
    }
  },
  getExpensesByGroup: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { groupId } = req.params;

      const expenses = await db.Expense.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: db.User,
            as: "paidByUser",
            attributes: ["user_id", "user_name", "user_email"],
          },
          {
            model: db.Group,
            as: "groupExpense",
            attributes: ["group_id", "group_name"],
          },
          {
            model: db.ExpenseSplit,
            as: "splits",
            include: [
              {
                model: db.User,
                as: "user",
                attributes: ["user_id", "user_name", "user_email"],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      const normalizedExpenses = expenses.map((exp: any) => {
        const plain = exp.toJSON ? exp.toJSON() : exp;
        return {
          ...plain,
          amount: Number(plain.amount),
          splits: Array.isArray(plain.splits)
            ? plain.splits.map((split: any) => ({
                ...((split.toJSON && split.toJSON()) || split),
                amount: Number(split.amount),
              }))
            : [],
        };
      });

      return res.status(200).json(normalizedExpenses);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error del servidor al obtener los gastos" });
    }
  },

  // Actualizar un gasto (y recalcular sus splits)
  updateExpense: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { expenseId } = req.params;
      const {
        group_id,
        paid_by_user_id,
        amount,
        description,
        created_at,
        split_type,
        splits,
      } = req.body;
      const loggedInUserId = req.user?.id;

      const expense = await db.Expense.findOne({
        where: { expense_id: Number(expenseId) },
      });

      if (!expense) {
        return res.status(404).json({ error: "Gasto no encontrado" });
      }

      const currentGroupId = expense.group_id;
      const targetGroupId =
        group_id !== undefined ? Number(group_id) : currentGroupId;
      const newAmount =
        amount !== undefined ? Number(amount) : Number(expense.amount);
      const payerId =
        paid_by_user_id !== undefined
          ? Number(paid_by_user_id)
          : expense.paid_by_user_id;

      // Verificar que el usuario es miembro del grupo actual del gasto
      const isMember = await db.GroupMembers.findOne({
        where: { group_id: currentGroupId, user_id: loggedInUserId },
      });
      if (!isMember) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para modificar este gasto." });
      }

      if (group_id !== undefined && Number(group_id) !== currentGroupId) {
        const groupExists = await db.Group.findOne({
          where: { group_id: targetGroupId },
        });
        if (!groupExists) {
          return res.status(404).json({ error: "El grupo no existe" });
        }

        const isMemberOfNewGroup = await db.GroupMembers.findOne({
          where: { group_id: targetGroupId, user_id: loggedInUserId },
        });
        if (!isMemberOfNewGroup) {
          return res.status(403).json({
            error: "No tienes permiso para mover este gasto a ese grupo.",
          });
        }
      }

      if (paid_by_user_id !== undefined) {
        const userExists = await db.User.findOne({
          where: { user_id: payerId },
        });
        if (!userExists) {
          return res.status(404).json({ error: "El usuario no existe" });
        }

        const isPayerMember = await db.GroupMembers.findOne({
          where: { group_id: targetGroupId, user_id: payerId },
        });
        if (!isPayerMember) {
          return res.status(400).json({
            error: "El usuario que pagó no es miembro de este grupo de viaje",
          });
        }
      }

      await expense.update({
        group_id: targetGroupId,
        paid_by_user_id: payerId,
        amount: Number(newAmount.toFixed(2)),
        description: description ?? expense.description,
        created_at: created_at ?? expense.created_at,
      });

      const shouldRecalculateSplits =
        split_type !== undefined ||
        splits !== undefined ||
        amount !== undefined ||
        group_id !== undefined;

      if (shouldRecalculateSplits) {
        const memberships = await db.GroupMembers.findAll({
          where: { group_id: targetGroupId },
        });
        const memberIds: number[] = memberships.map((m: any) =>
          Number(m.user_id),
        );
        const resolvedSplitType: "equal" | "custom" =
          split_type === "custom" ? "custom" : "equal";

        let splitData: { user_id: number; amount: number }[] = [];

        if (resolvedSplitType === "equal") {
          const share = Number((newAmount / memberIds.length).toFixed(2));
          const totalRounded = share * (memberIds.length - 1);
          const lastShare = Number((newAmount - totalRounded).toFixed(2));
          splitData = memberIds.map((uid, idx) => ({
            user_id: uid,
            amount: idx === memberIds.length - 1 ? lastShare : share,
          }));
        } else {
          if (!splits || !Array.isArray(splits) || splits.length === 0) {
            return res.status(400).json({
              error:
                "Debes proporcionar el desglose de partes (splits) para el modo personalizado.",
            });
          }
          const splitsSum = splits.reduce(
            (acc: number, s: any) => acc + Number(s.amount),
            0,
          );
          if (Math.abs(splitsSum - newAmount) > 0.02) {
            return res.status(400).json({
              error: `La suma de las partes (${splitsSum.toFixed(2)}€) no coincide con el importe total (${newAmount.toFixed(2)}€).`,
            });
          }
          splitData = splits.map((s: any) => ({
            user_id: Number(s.user_id),
            amount: Number(Number(s.amount).toFixed(2)),
          }));
        }

        await db.ExpenseSplit.destroy({
          where: { expense_id: Number(expenseId) },
        });
        await db.ExpenseSplit.bulkCreate(
          splitData.map((s) => ({
            expense_id: Number(expenseId),
            user_id: s.user_id,
            amount: s.amount,
          })),
        );
      }

      return res.status(200).json({
        message: "Gasto actualizado con éxito",
        expense,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error del servidor al actualizar el gasto" });
    }
  },

  // Borrar un gasto (y sus splits en cascada)
  deleteExpense: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { expenseId } = req.params;
      const loggedInUserId = req.user?.id;

      const expense = await db.Expense.findOne({
        where: { expense_id: Number(expenseId) },
      });

      if (!expense) {
        return res.status(404).json({ error: "Gasto no encontrado" });
      }

      const membership = await db.GroupMembers.findOne({
        where: { group_id: expense.group_id, user_id: loggedInUserId },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para eliminar este gasto." });
      }

      await db.ExpenseSplit.destroy({
        where: { expense_id: Number(expenseId) },
      });
      await db.Expense.destroy({ where: { expense_id: Number(expenseId) } });

      return res.status(200).json({ message: "Gasto eliminado con éxito" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error del servidor al borrar el gasto" });
    }
  },

  // Cálculo de balances y deudas inteligente (usa los splits reales de cada gasto)
  getGroupBalances: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { groupId } = req.params;

      // 1. Obtener todos los miembros del grupo
      const memberships = await db.GroupMembers.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["user_id", "user_name", "user_email"],
          },
        ],
      });

      if (memberships.length === 0) {
        return res
          .status(404)
          .json({ error: "El grupo no existe o no tiene miembros." });
      }

      const members = memberships.map((m: any) => m.user);
      const numMembers = members.length;

      // 2. Obtener todos los gastos con sus splits
      const expenses = await db.Expense.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: db.ExpenseSplit,
            as: "splits",
          },
        ],
      });

      // 3. Calcular el total gastado
      const totalAmount = expenses.reduce(
        (sum: number, exp: any) => sum + Number(exp.amount),
        0,
      );

      // 4. Inicializar mapas por usuario
      const totalPaidByUser: Record<number, number> = {};
      const totalOwedByUser: Record<number, number> = {};

      members.forEach((m: any) => {
        totalPaidByUser[m.user_id] = 0;
        totalOwedByUser[m.user_id] = 0;
      });

      // 5. Para cada gasto: acumular lo pagado y lo que debe cada uno (según su split)
      expenses.forEach((exp: any) => {
        const payerId = exp.paid_by_user_id;
        if (totalPaidByUser[payerId] !== undefined) {
          totalPaidByUser[payerId] += Number(exp.amount);
        }

        // Sumar lo que debe cada miembro según su split
        if (exp.splits && exp.splits.length > 0) {
          exp.splits.forEach((split: any) => {
            const uid = split.user_id;
            if (totalOwedByUser[uid] !== undefined) {
              totalOwedByUser[uid] += Number(split.amount);
            }
          });
        } else {
          // Fallback: si no hay splits (gastos legacy), división igual
          const share = Number((Number(exp.amount) / numMembers).toFixed(2));
          members.forEach((m: any) => {
            if (totalOwedByUser[m.user_id] !== undefined) {
              totalOwedByUser[m.user_id] += share;
            }
          });
        }
      });

      // 6. Construir lista de balances individuales: lo pagado - lo que debo
      const sharePerMember =
        numMembers > 0 ? Number((totalAmount / numMembers).toFixed(2)) : 0;

      const userBalances = members.map((m: any) => {
        const paid = totalPaidByUser[m.user_id] || 0;
        const owed = totalOwedByUser[m.user_id] || 0;
        const balance = Number((paid - owed).toFixed(2));
        return {
          user_id: m.user_id,
          user_name: m.user_name,
          user_email: m.user_email,
          total_paid: paid,
          total_owed: owed,
          share: sharePerMember,
          net_balance: balance,
        };
      });

      // 7. Algoritmo de Simplificación de Deudas
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

        const creditorOwed = creditor.net_balance;
        const debtorOwes = -debtor.net_balance;

        const transferAmount = Number(
          Math.min(creditorOwed, debtorOwes).toFixed(2),
        );

        suggestedTransfers.push({
          from_user_id: debtor.user_id,
          from_user_name: debtor.user_name,
          to_user_id: creditor.user_id,
          to_user_name: creditor.user_name,
          amount: transferAmount,
        });

        creditor.net_balance = Number(
          (creditor.net_balance - transferAmount).toFixed(2),
        );
        debtor.net_balance = Number(
          (debtor.net_balance + transferAmount).toFixed(2),
        );

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
        suggested_transfers: suggestedTransfers,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error del servidor al obtener el balance de cuentas" });
    }
  },
};
