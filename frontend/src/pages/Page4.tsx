import { useState } from "react";
import { useTrips } from "../hooks/useTrips.ts";
import { useExpenses } from "../hooks/useExpenses.ts";
import { useAuthContext } from "../context/AuthContext.tsx";
import "../styles/dashboard.css";

const Page4 = () => {
  const { user } = useAuthContext();
  const { activeGroupId, activeGroupName, members } = useTrips();
  const { expenses, createExpense, loading } = useExpenses(activeGroupId);

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // El pagador por defecto es el usuario autenticado si es miembro, o el primer miembro en la lista
  const loggedInUserMember = members.find((m) => m.user_id === user?.id);
  const defaultPayer = loggedInUserMember
    ? String(loggedInUserMember.user_id)
    : (members.length > 0 ? String(members[0].user_id) : "");

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paid_by_user_id: "",
  });

  // Sincronizar el pagador por defecto cuando cambian los miembros
  const currentPayer = form.paid_by_user_id || defaultPayer;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.description || !form.amount || !currentPayer) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setFormError("");

    const successResponse = await createExpense(
      form.description,
      Number(form.amount),
      Number(currentPayer)
    );

    if (successResponse) {
      setSuccess("¡Gasto registrado y dividido correctamente!");
      setForm((prev) => ({ ...prev, description: "", amount: "" }));
      setOpen(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Gastos</h2>
        <p className="page-subtitle">
          Revisa el historial de pagos de tu viaje y añade nuevos gastos compartidos.
        </p>
      </div>

      {!activeGroupId ? (
        <div className="alert-warning">
          <span className="alert-icon">⚠️</span>
          <h4>Ningún viaje activo seleccionado</h4>
          <p>Por favor, ve a la pestaña de <strong>Viajes</strong> para crear uno o seleccionar un viaje de tu lista.</p>
        </div>
      ) : (
        <div className="page-container">

          <div className="active-trip-banner">
            <div>
              <span className="banner-label">Viaje Activo</span>
              <h3 className="banner-title">{activeGroupName}</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-primary"
            >
              {open ? "Cerrar" : "+ Añadir Gasto"}
            </button>
          </div>

          {open && (
            <form onSubmit={handleSubmit} className="dashboard-form" style={{ maxWidth: "450px" }}>
              <h3 className="form-title">Añadir Gasto al Viaje</h3>
              {formError && <p className="msg-error">{formError}</p>}

              <div className="form-group">
                <label htmlFor="description" className="form-label">Descripción / Concepto</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Ej: Gasolina, Supermercado, Almuerzo..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">Monto (€)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label htmlFor="paid_by_user_id" className="form-label">¿Quién pagó?</label>
                  <select
                    id="paid_by_user_id"
                    name="paid_by_user_id"
                    value={currentPayer}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.user_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Registrando..." : "Confirmar Gasto"}
              </button>
            </form>
          )}

          {success && <p className="msg-success">{success}</p>}

          <div className="page-container">
            <h3 className="section-title">Historial de Gastos</h3>

            {expenses.length === 0 ? (
              <div className="empty-state-large">
                <span className="emoji">💸</span>
                <p>No hay gastos registrados en este viaje aún.</p>
              </div>
            ) : (
              <div className="card-list">
                {expenses.map((exp) => (
                  <div key={exp.expense_id} className="list-card">
                    <div>
                      <h4 className="card-title">{exp.description}</h4>
                      <p className="card-subtitle">
                        Pagado por: <strong>{exp.paidByUser?.user_name || "Desconocido"}</strong>
                      </p>
                      <span className="expense-date">📅 {exp.created_at}</span>
                    </div>
                    <span className="expense-amount">{exp.amount.toFixed(2)} €</span>
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