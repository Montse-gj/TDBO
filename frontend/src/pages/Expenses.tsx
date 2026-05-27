import { useState, useEffect } from "react";
import { useTrips } from "../hooks/useTrips.ts";
import { useExpenses } from "../hooks/useExpenses.ts";
import type { SplitEntry } from "../hooks/useExpenses.ts";
import { useAuthContext } from "../context/AuthContext.tsx";

type SplitMode = "equal" | "custom";

const Expenses = () => {
  const { user } = useAuthContext();
  const { activeGroupId, activeGroupName, members } = useTrips();
  const {
    expenses,
    createExpense,
    updateExpense,
    deleteExpense,
    loading,
    error,
  } = useExpenses(activeGroupId);

  const safeExpenses = expenses.map((exp) => ({
    ...exp,
    amount: Number(exp.amount),
    splits: Array.isArray(exp.splits)
      ? exp.splits.map((split) => ({
        ...split,
        amount: Number(split.amount),
      }))
      : [],
  }));

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // El pagador por defecto es el usuario autenticado si es miembro, o el primer miembro en la lista
  const loggedInUserMember = members.find((m) => m.user_id === user?.id);
  const defaultPayer = loggedInUserMember
    ? String(loggedInUserMember.user_id)
    : members.length > 0
      ? String(members[0].user_id)
      : "";

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paid_by_user_id: "",
    splitMode: "equal" as SplitMode,
  });

  // Splits personalizados: mapa user_id → importe como string
  const [customSplits, setCustomSplits] = useState<Record<number, string>>({});

  // Cuando cambian los miembros, inicializar el mapa de custom splits a vacío
  useEffect(() => {
    const initial: Record<number, string> = {};
    members.forEach((m) => {
      initial[m.user_id] = "";
    });
    setCustomSplits(initial);
  }, [members]);

  const currentPayer = form.paid_by_user_id || defaultPayer;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalAmount = parseFloat(form.amount) || 0;
  const equalShare = members.length > 0 ? totalAmount / members.length : 0;

  const splitsSum = Object.values(customSplits).reduce(
    (acc, v) => acc + (parseFloat(v) || 0),
    0,
  );
  const splitsRemaining = Number((totalAmount - splitsSum).toFixed(2));

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!form.description || !form.amount || !currentPayer) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    if (form.splitMode === "custom") {
      if (Math.abs(splitsRemaining) > 0.02) {
        setFormError(
          `La suma de las partes (${splitsSum.toFixed(2)}€) no coincide con el total (${totalAmount.toFixed(2)}€). Faltan ${splitsRemaining.toFixed(2)}€.`,
        );
        return;
      }
    }

    const splitEntries: SplitEntry[] | undefined =
      form.splitMode === "custom"
        ? members.map((m) => ({
          user_id: m.user_id,
          amount: parseFloat(customSplits[m.user_id] || "0"),
        }))
        : undefined;

    const ok = await createExpense(
      form.description,
      totalAmount,
      Number(currentPayer),
      form.splitMode,
      splitEntries,
    );

    if (ok) {
      setSuccess("¡Gasto registrado correctamente!");
      setForm((prev) => ({ ...prev, description: "", amount: "" }));
      const resetSplits: Record<number, string> = {};
      members.forEach((m) => {
        resetSplits[m.user_id] = "";
      });
      setCustomSplits(resetSplits);
      setOpen(false);
    } else {
      setFormError(error || "Error al registrar el gasto.");
    }
  };

  const handleDelete = async (expenseId: number) => {
    setSuccess("");
    const ok = await deleteExpense(expenseId);
    if (ok) setSuccess("Gasto eliminado correctamente.");
  };

  // Estado de edición inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    paid_by_user_id: "",
    splitMode: "equal" as SplitMode,
  });
  const [editCustomSplits, setEditCustomSplits] = useState<
    Record<number, string>
  >({});

  const startEdit = (exp: (typeof expenses)[0]) => {
    setEditingId(exp.expense_id);
    setEditForm({
      description: exp.description,
      amount: String(exp.amount),
      paid_by_user_id: String(exp.paid_by_user_id),
      splitMode: exp.splits && exp.splits.length > 0 ? "custom" : "equal",
    });
    const splits: Record<number, string> = {};
    members.forEach((m) => {
      const found = exp.splits?.find((s) => s.user_id === m.user_id);
      splits[m.user_id] = found ? String(found.amount) : "";
    });
    setEditCustomSplits(splits);
    setSuccess("");
  };

  const editTotal = parseFloat(editForm.amount) || 0;
  const editSplitsSum = Object.values(editCustomSplits).reduce(
    (acc, v) => acc + (parseFloat(v) || 0),
    0,
  );
  const editSplitsRemaining = Number((editTotal - editSplitsSum).toFixed(2));

  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (
      editForm.splitMode === "custom" &&
      Math.abs(editSplitsRemaining) > 0.02
    ) {
      setFormError(
        `La suma de las partes (${editSplitsSum.toFixed(2)}€) no coincide con el total (${editTotal.toFixed(2)}€).`,
      );
      return;
    }

    const splitEntries: SplitEntry[] | undefined =
      editForm.splitMode === "custom"
        ? members.map((m) => ({
          user_id: m.user_id,
          amount: parseFloat(editCustomSplits[m.user_id] || "0"),
        }))
        : undefined;

    const ok = await updateExpense(editingId!, {
      description: editForm.description,
      amount: editTotal,
      paid_by_user_id: Number(editForm.paid_by_user_id),
      split_type: editForm.splitMode,
      splits: splitEntries,
    });

    if (ok) {
      setSuccess("Gasto actualizado correctamente.");
      setEditingId(null);
    } else {
      setFormError(error || "Error al actualizar el gasto.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Gastos</h2>
        <p className="page-subtitle">
          Revisa el historial de pagos de tu viaje y añade nuevos gastos
          compartidos.
        </p>
      </div>

      {!activeGroupId ? (
        <div className="alert-warning">
          <span className="alert-icon">⚠️</span>
          <h4>Ningún viaje activo seleccionado</h4>
          <p>
            Por favor, ve a la pestaña de <strong>Viajes</strong> para crear uno
            o seleccionar un viaje de tu lista.
          </p>
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
              onClick={() => {
                setOpen((v) => !v);
                setSuccess("");
                setFormError("");
              }}
              className="btn-primary"
            >
              {open ? "Cerrar" : "+ Añadir Gasto"}
            </button>
          </div>

          {/* Formulario de nuevo gasto */}
          {open && (
            <form
              onSubmit={handleSubmit}
              className="dashboard-form"
              style={{ maxWidth: "500px" }}
            >
              <h3 className="form-title">Añadir Gasto al Viaje</h3>
              {formError && <p className="msg-error">{formError}</p>}

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción / Concepto
                </label>
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
                  <label htmlFor="amount" className="form-label">
                    Monto (€)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label htmlFor="paid_by_user_id" className="form-label">
                    ¿Quién pagó?
                  </label>
                  <select
                    id="paid_by_user_id"
                    name="paid_by_user_id"
                    value={currentPayer}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Modo de División</label>
                <div className="form-row" style={{ gap: "0.5rem" }}>
                  <button
                    type="button"
                    className={
                      form.splitMode === "equal"
                        ? "btn-primary"
                        : "btn-secondary"
                    }
                    onClick={() =>
                      setForm((p) => ({ ...p, splitMode: "equal" }))
                    }
                    style={{ flex: 1 }}
                  >
                    ÷ Por Igualdad
                  </button>
                  <button
                    type="button"
                    className={
                      form.splitMode === "custom"
                        ? "btn-primary"
                        : "btn-secondary"
                    }
                    onClick={() =>
                      setForm((p) => ({ ...p, splitMode: "custom" }))
                    }
                    style={{ flex: 1 }}
                  >
                    ✏️ Por Partes
                  </button>
                </div>
              </div>

              {form.splitMode === "equal" && totalAmount > 0 && (
                <div className="split-preview">
                  <p className="form-label" style={{ marginBottom: "0.5rem" }}>
                    Cada persona paga:{" "}
                    <strong>{equalShare.toFixed(2)} €</strong>
                  </p>
                  {members.map((m) => (
                    <div key={m.user_id} className="split-row">
                      <span>{m.user_name}</span>
                      <span>{equalShare.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              {form.splitMode === "custom" && (
                <div className="split-preview">
                  <p className="form-label" style={{ marginBottom: "0.5rem" }}>
                    Asigna la cuota de cada persona:
                  </p>
                  {members.map((m) => (
                    <div key={m.user_id} className="split-row">
                      <span style={{ flex: 1 }}>{m.user_name}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={customSplits[m.user_id] ?? ""}
                        onChange={(e) =>
                          setCustomSplits((prev) => ({
                            ...prev,
                            [m.user_id]: e.target.value,
                          }))
                        }
                        className="form-input"
                        style={{ width: "100px" }}
                      />
                      <span style={{ width: "20px" }}>€</span>
                    </div>
                  ))}
                  <div
                    className={`split-total ${Math.abs(splitsRemaining) > 0.02 ? "split-total--error" : "split-total--ok"}`}
                  >
                    {Math.abs(splitsRemaining) <= 0.02
                      ? "✅ El reparto cuadra"
                      : splitsRemaining > 0
                        ? `⚠️ Faltan ${splitsRemaining.toFixed(2)} € por asignar`
                        : `⚠️ Te pasas ${Math.abs(splitsRemaining).toFixed(2)} € del total`}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: "1rem" }}
              >
                {loading ? "Registrando..." : "Confirmar Gasto"}
              </button>
            </form>
          )}

          {success && <p className="msg-success">{success}</p>}

          {/* Historial de gastos */}
          <div className="page-container">
            <h3 className="section-title">Historial de Gastos</h3>

            {expenses.length === 0 ? (
              <div className="empty-state-large">
                <span className="emoji">💸</span>
                <p>No hay gastos registrados en este viaje aún.</p>
              </div>
            ) : (
              <div className="card-list">
                {safeExpenses.map((exp) =>
                  editingId === exp.expense_id ? (
                    <form
                      key={exp.expense_id}
                      onSubmit={handleEditSubmit}
                      className="list-card"
                      style={{ flexDirection: "column", gap: "0.75rem" }}
                    >
                      {formError && <p className="msg-error">{formError}</p>}
                      <div className="form-row">
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          className="form-input"
                          placeholder="Descripción"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              amount: e.target.value,
                            }))
                          }
                          className="form-input"
                          style={{ width: "100px" }}
                          required
                        />
                        <select
                          value={editForm.paid_by_user_id}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              paid_by_user_id: e.target.value,
                            }))
                          }
                          className="form-input"
                        >
                          {members.map((m) => (
                            <option key={m.user_id} value={m.user_id}>
                              {m.user_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-row" style={{ gap: "0.5rem" }}>
                        <button
                          type="button"
                          className={
                            editForm.splitMode === "equal"
                              ? "btn-primary"
                              : "btn-secondary"
                          }
                          onClick={() =>
                            setEditForm((p) => ({ ...p, splitMode: "equal" }))
                          }
                          style={{ flex: 1, fontSize: "0.8rem" }}
                        >
                          ÷ Por Igualdad
                        </button>
                        <button
                          type="button"
                          className={
                            editForm.splitMode === "custom"
                              ? "btn-primary"
                              : "btn-secondary"
                          }
                          onClick={() =>
                            setEditForm((p) => ({ ...p, splitMode: "custom" }))
                          }
                          style={{ flex: 1, fontSize: "0.8rem" }}
                        >
                          ✏️ Por Partes
                        </button>
                      </div>

                      {editForm.splitMode === "custom" && (
                        <div className="split-preview">
                          {members.map((m) => (
                            <div key={m.user_id} className="split-row">
                              <span style={{ flex: 1 }}>{m.user_name}</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editCustomSplits[m.user_id] ?? ""}
                                onChange={(e) =>
                                  setEditCustomSplits((prev) => ({
                                    ...prev,
                                    [m.user_id]: e.target.value,
                                  }))
                                }
                                className="form-input"
                                style={{ width: "90px" }}
                              />
                              <span>€</span>
                            </div>
                          ))}
                          <div
                            className={`split-total ${Math.abs(editSplitsRemaining) > 0.02 ? "split-total--error" : "split-total--ok"}`}
                          >
                            {Math.abs(editSplitsRemaining) <= 0.02
                              ? "✅ El reparto cuadra"
                              : editSplitsRemaining > 0
                                ? `⚠️ Faltan ${editSplitsRemaining.toFixed(2)} €`
                                : `⚠️ Te pasas ${Math.abs(editSplitsRemaining).toFixed(2)} €`}
                          </div>
                        </div>
                      )}

                      <div className="form-row" style={{ gap: "0.5rem" }}>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary"
                          style={{ flex: 1, fontSize: "0.85rem" }}
                        >
                          {loading ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setFormError("");
                          }}
                          className="btn-secondary"
                          style={{ flex: 1, fontSize: "0.85rem" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div key={exp.expense_id} className="list-card">
                      <div style={{ flex: 1 }}>
                        <h4 className="card-title">{exp.description}</h4>
                        <p className="card-subtitle">
                          Pagado por:{" "}
                          <strong>
                            {exp.paidByUser?.user_name || "Desconocido"}
                          </strong>
                        </p>
                        <span className="expense-date">
                          📅 {exp.created_at}
                        </span>
                        {exp.splits && exp.splits.length > 0 && (
                          <div className="split-detail">
                            {exp.splits.map((s) => (
                              <span key={s.split_id} className="split-chip">
                                {s.user?.user_name || `#${s.user_id}`}:{" "}
                                {Number(s.amount).toFixed(2)} €
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="expense-amount">
                          {exp.amount.toFixed(2)} €
                        </span>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => startEdit(exp)}
                            className="btn-secondary"
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                            }}
                            title="Editar gasto"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.expense_id)}
                            className="btn-danger"
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                            }}
                            title="Eliminar gasto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
