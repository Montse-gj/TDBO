import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import type { BalanceResponse } from "../types/dashboard.types.ts";

export type { BalanceResponse };

export const useBalances = (activeGroupId: number | null) => {
  const { token } = useAuthContext();
  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBalances = useCallback(async () => {
    if (!token || !activeGroupId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/expenses/group/${activeGroupId}/balances`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al obtener los balances del viaje");
        return;
      }
      setBalances(data as BalanceResponse);
    } catch {
      setError("No se pudo conectar con el servidor backend");
    } finally {
      setLoading(false);
    }
  }, [token, activeGroupId]);

  useEffect(() => {
    if (activeGroupId) {
      loadBalances();
    } else {
      setBalances(null);
    }
  }, [activeGroupId, loadBalances]);

  return { balances, loading, error, loadBalances };
};
