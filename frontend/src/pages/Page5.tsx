import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";

type MemberBalance = {
  user_id: number;
  user_name: string;
  user_email: string;
  total_paid: number;
  share: number;
  net_balance: number;
};

type SuggestedTransfer = {
  from_user_id: number;
  from_user_name: string;
  to_user_id: number;
  to_user_name: string;
  amount: number;
};

type BalanceResponse = {
  group_id: number;
  total_group_spent: number;
  number_of_members: number;
  share_per_member: number;
  member_balances: MemberBalance[];
  suggested_transfers: SuggestedTransfer[];
};

const Page5 = () => {
  const { token, user } = useAuthContext();

  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar estado inicial del viaje activo
  useEffect(() => {
    const storedActiveId = localStorage.getItem("activeGroupId");
    const storedActiveName = localStorage.getItem("activeGroupName");
    if (storedActiveId) {
      setActiveGroupId(Number(storedActiveId));
    }
    if (storedActiveName) {
      setActiveGroupName(storedActiveName);
    }
  }, []);

  // Cargar balances e informes de la API
  const loadBalances = async (groupId: number) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/expenses/group/${groupId}/balances`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al obtener los balances del viaje");
        return;
      }

      setBalances(data);
    } catch {
      setError("No se pudo conectar con el servidor backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeGroupId) {
      loadBalances(activeGroupId);
    }
  }, [activeGroupId, token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Sección Header */}
      <div>
        <h2 style={{ fontFamily: "var(--font-menu)", color: "var(--green)", fontSize: "1.8rem", margin: "0 0 0.5rem 0" }}>Saldos y Cuentas</h2>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#666" }}>
          Revisa el desglose de deudas de cada integrante y la propuesta inteligente para saldar cuentas.
        </p>
      </div>

      {!activeGroupId ? (
        <div style={{ padding: "2rem", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", color: "#92400e", textAlign: "center" }}>
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <h4 style={{ margin: "0.5rem 0" }}>Ningún viaje activo seleccionado</h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Por favor, ve a la pestaña de **Viajes** para crear uno o seleccionar un viaje de tu lista.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Badge Viaje Activo */}
          <div style={{ padding: "1rem 1.5rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "#64748b" }}>Viaje Activo</span>
              <h3 style={{ margin: 0, color: "var(--green)", fontSize: "1.4rem", fontWeight: "800" }}>{activeGroupName}</h3>
            </div>
            
            <button 
              type="button"
              onClick={() => activeGroupId && loadBalances(activeGroupId)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#fff",
                color: "#333",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Recargar Cuentas
            </button>
          </div>

          {error && (
            <div style={{ padding: "1rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b" }}>
              {error}
            </div>
          )}

          {loading && <p style={{ fontSize: "0.95rem", color: "#666", fontStyle: "italic" }}>Calculando deudas y balances...</p>}

          {balances && !loading && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "start" }}>
              
              {/* COLUMNA IZQUIERDA: RESUMEN GENERAL Y CUOTAS POR MIEMBRO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                
                {/* Caja Resumen de Gastos */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Gasto Total del Grupo</span>
                    <h3 style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "var(--green)" }}>
                      {balances.total_group_spent.toFixed(2)} €
                    </h3>
                  </div>

                  <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Cuota por Persona</span>
                    <h3 style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "#334155" }}>
                      {balances.share_per_member.toFixed(2)} €
                    </h3>
                  </div>
                </div>

                {/* Tabla de Cuentas Individuales */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#333" }}>Resumen de Cuentas</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {balances.member_balances.map((mb) => {
                      const hasPositiveBalance = mb.net_balance > 0.01;
                      const hasNegativeBalance = mb.net_balance < -0.01;
                      
                      let balanceColor = "#667085"; // Neutro
                      let balanceBg = "#f4f5f7";
                      let balanceLabel = "Al día";
                      let balanceText = "0.00 €";

                      if (hasPositiveBalance) {
                        balanceColor = "#15803d"; // Verde
                        balanceBg = "#dcfce7";
                        balanceLabel = "Se le debe devolver";
                        balanceText = `+${mb.net_balance.toFixed(2)} €`;
                      } else if (hasNegativeBalance) {
                        balanceColor = "#b91c1c"; // Rojo
                        balanceBg = "#fee2e2";
                        balanceLabel = "Debe aportar";
                        balanceText = `${mb.net_balance.toFixed(2)} €`;
                      }

                      return (
                        <div 
                          key={mb.user_id}
                          style={{
                            padding: "1rem 1.2rem",
                            borderRadius: "14px",
                            border: "1px solid #f0f0f0",
                            background: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <h4 style={{ margin: "0 0 0.2rem 0", color: "#333", fontSize: "1rem", fontWeight: "700" }}>
                              {mb.user_name} {mb.user_id === user?.id && <span style={{ fontSize: "0.75rem", color: "#777", fontWeight: "normal" }}>(Tú)</span>}
                            </h4>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>
                              Aportó: <strong style={{ color: "#333" }}>{mb.total_paid.toFixed(2)} €</strong>
                            </p>
                          </div>

                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                            <span 
                              style={{ 
                                fontSize: "1.1rem", 
                                fontWeight: "800", 
                                color: balanceColor 
                              }}
                            >
                              {balanceText}
                            </span>
                            <span 
                              style={{ 
                                fontSize: "0.7rem", 
                                fontWeight: "700", 
                                padding: "0.15rem 0.4rem", 
                                borderRadius: "6px", 
                                background: balanceBg, 
                                color: balanceColor 
                              }}
                            >
                              {balanceLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* COLUMNA DERECHA: LIQUIDACIÓN DE CUENTAS (TRANSFERENCIAS SUGERIDAS) */}
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "1.5rem", 
                  padding: "1.5rem", 
                  background: "#fcfdfc", 
                  borderRadius: "18px", 
                  border: "1px solid #edf5ed", 
                  minHeight: "300px" 
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.2rem", color: "#333" }}>Propuesta de Liquidación</h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>
                    Método optimizado de Tricount para saldar cuentas con la menor cantidad de transacciones.
                  </p>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #edf5ed", margin: "0.2rem 0" }} />

                {balances.suggested_transfers.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#15803d", gap: "0.8rem", textAlign: "center", padding: "3rem" }}>
                    <span style={{ fontSize: "2.5rem" }}>🎉</span>
                    <h4 style={{ margin: 0, fontWeight: "700" }}>¡Cuentas al día!</h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>Todos han aportado exactamente su cuota. No es necesario realizar transferencias.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {balances.suggested_transfers.map((trans, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: "1.2rem",
                          borderRadius: "12px",
                          background: "#fff",
                          border: "1px solid #eef2ee",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.8rem"
                        }}
                      >
                        {/* Flujo de dinero */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Deudor</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#b91c1c" }}>{trans.from_user_name}</span>
                          </div>

                          <div style={{ fontSize: "1.2rem", color: "#888", display: "flex", alignItems: "center" }}>➡️</div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Acreedor</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#15803d" }}>{trans.to_user_name}</span>
                          </div>

                        </div>

                        {/* Monto de transferencia */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.8rem", background: "rgba(21, 128, 61, 0.04)", borderRadius: "8px", border: "1px dashed rgba(21, 128, 61, 0.15)" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#166534" }}>Debe transferir:</span>
                          <strong style={{ fontSize: "1.1rem", fontWeight: "800", color: "#166534" }}>{trans.amount.toFixed(2)} €</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Page5;