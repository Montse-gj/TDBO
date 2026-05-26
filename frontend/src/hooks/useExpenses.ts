import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import type { Expense } from "../types/dashboard.types.ts";

export type { Expense };

export type SplitEntry = { user_id: number; amount: number };

export const useExpenses = (activeGroupId: number | null) => {
  const { token } = useAuthContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadExpenses = useCallback(async () => {
    if (!token || !activeGroupId) return;
    try {
      const response = await fetch(`/api/expenses/${activeGroupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: Expense[] = await response.json();
        const normalized = data.map((expense) => ({
          ...expense,
          amount: Number(expense.amount),
          splits: Array.isArray(expense.splits)
            ? expense.splits.map((split) => ({
                ...split,
                amount: Number(split.amount),
              }))
            : [],
        }));
        setExpenses(normalized);
      }
    } catch (err) {
      console.error("Error al cargar gastos:", err);
    }
  }, [token, activeGroupId]);

  useEffect(() => {
    if (activeGroupId) {
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [activeGroupId, loadExpenses]);

  const createExpense = async (
    description: string,
    amount: number,
    paid_by_user_id: number,
    split_type: "equal" | "custom",
    splits?: SplitEntry[],
  ): Promise<boolean> => {
    if (!activeGroupId || !token) return false;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: activeGroupId,
          description,
          amount,
          paid_by_user_id,
          split_type,
          splits: split_type === "custom" ? splits : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al registrar el gasto");
        return false;
      }
      await loadExpenses();
      return true;
    } catch {
      setError("No se pudo conectar con el servidor backend");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (
    expenseId: number,
    fields: {
      description?: string;
      amount?: number;
      paid_by_user_id?: number;
      split_type?: "equal" | "custom";
      splits?: SplitEntry[];
    },
  ): Promise<boolean> => {
    if (!token) return false;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al actualizar el gasto");
        return false;
      }
      await loadExpenses();
      return true;
    } catch {
      setError("No se pudo conectar con el servidor backend");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: number): Promise<boolean> => {
    if (!token) return false;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al eliminar el gasto");
        return false;
      }
      await loadExpenses();
      return true;
    } catch {
      setError("No se pudo conectar con el servidor backend");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    setError,
  };
};
