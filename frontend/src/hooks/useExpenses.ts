import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import type { Expense } from "../types/dashboard.types.ts";

export type { Expense };

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
        setExpenses(data);
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
    paid_by_user_id: number
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

  return { expenses, loading, error, createExpense, setError };
};
