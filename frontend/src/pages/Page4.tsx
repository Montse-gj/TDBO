import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";

type Expense = {
  expense_id: number;
  group_id: number;
  paid_by_user_id: number;
  amount: number;
  description: string;
  created_at: string;
  paidByUser: {
    user_id: number;
    user_name: string;
    user_email: string;
  };
};

type Member = {
  user_id: number;
  user_name: string;
  user_email: string;
};

const Page4 = () => {
  const { token } = useAuthContext();
  
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paid_by_user_id: "",
  });

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

  // Cargar gastos y miembros si hay un viaje activo
  const loadExpenses = async (groupId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/expenses/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Error al cargar gastos:", err);
    }
  };

  const loadMembers = async (groupId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/trips/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const memberList = data.groupMembers.map((m: any) => m.user).filter(Boolean);
        setMembers(memberList);
        
        // Inicializar el pagador del formulario en el primer miembro por defecto
        if (memberList.length > 0) {
          setForm((prev) => ({
            ...prev,
            paid_by_user_id: String(memberList[0].user_id),
          }));
        }
      }
    } catch (err) {
      console.error("Error al cargar miembros:", err);
    }
  };

  useEffect(() => {
    if (activeGroupId) {
      loadExpenses(activeGroupId);
      loadMembers(activeGroupId);
    }
  }, [activeGroupId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!activeGroupId || !token) return;

    if (!form.description || !form.amount || !form.paid_by_user_id) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: activeGroupId,
          description: form.description,
          amount: Number(form.amount),
          paid_by_user_id: Number(form.paid_by_user_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrar el gasto");
        return;
      }

      setSuccess("¡Gasto registrado y dividido correctamente!");
      
      // Limpiar campos de texto, dejar el pagador actual
      setForm((prev) => ({
        ...prev,
        description: "",
        amount: "",
      }));
      
      setOpen(false);
      loadExpenses(activeGroupId); // Recargar el listado de gastos
    } catch {
      setError("No se pudo conectar con el servidor backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Sección Header */}
      <div>
        <h2 style={{ fontFamily: "var(--font-menu)", color: "var(--green)", fontSize: "1.8rem", margin: "0 0 0.5rem 0" }}>Gastos</h2>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#666" }}>
          Revisa el historial de pagos de tu viaje y añade nuevos gastos compartidos.
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Badge Viaje Activo */}
          <div style={{ padding: "1rem 1.5rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "#64748b" }}>Viaje Activo</span>
              <h3 style={{ margin: 0, color: "var(--green)", fontSize: "1.4rem", fontWeight: "800" }}>{activeGroupName}</h3>
            </div>
            
            <button 
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                border: "none",
                background: "var(--green)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              {open ? "Cerrar" : "+ Añadir Gasto"}
            </button>
          </div>

          {/* Formulario para añadir gastos */}
          {open && (
            <form onSubmit={handleSubmit} style={{ padding: "1.5rem", background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "1.2rem", maxWidth: "450px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>Añadir Gasto al Viaje</h3>
              
              {error && <p style={{ color: "red", fontSize: "0.85rem", margin: 0 }}>{error}</p>}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="description" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>Descripción / Concepto</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Ej: Gasolina, Supermercado, Almuerzo..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
                  <label htmlFor="amount" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>Monto (€)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1.5 }}>
                  <label htmlFor="paid_by_user_id" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>¿Quién pagó?</label>
                  <select
                    id="paid_by_user_id"
                    name="paid_by_user_id"
                    value={form.paid_by_user_id}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.9rem", background: "#fff" }}
                  >
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.7rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--green)",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "0.5rem"
                }}
              >
                {loading ? "Registrando..." : "Confirmar Gasto"}
              </button>
            </form>
          )}

          {success && <p style={{ color: "green", fontWeight: "600", margin: 0 }}>{success}</p>}

          {/* Historial de Gastos */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ margin: "0.5rem 0 0 0", fontSize: "1.2rem", fontWeight: "700" }}>Historial de Gastos</h3>
            
            {expenses.length === 0 ? (
              <div style={{ padding: "3rem", background: "#fafafa", borderRadius: "12px", border: "1px dashed #ddd", textAlign: "center", color: "#999" }}>
                <span style={{ fontSize: "1.8rem" }}>💸</span>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", fontStyle: "italic" }}>No hay gastos registrados en este viaje aún.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {expenses.map((exp) => (
                  <div 
                    key={exp.expense_id}
                    style={{
                      padding: "1rem 1.2rem",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      background: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.01)"
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 0.2rem 0", color: "#333", fontSize: "1.05rem", fontWeight: "700" }}>{exp.description}</h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>
                        Pagado por: <strong style={{ color: "#333" }}>{exp.paidByUser?.user_name || "Desconocido"}</strong>
                      </p>
                      <span style={{ fontSize: "0.7rem", color: "#aaa" }}>
                        📅 {exp.created_at}
                      </span>
                    </div>

                    <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--green)" }}>
                      {exp.amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Page4;