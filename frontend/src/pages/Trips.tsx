import { useState } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";

type GroupForm = {
  group_name: string;
  trip_starts: string;
  trip_ends: string;
};

const Trips = () => {
  const { token, user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<GroupForm>({
    group_name: "",
    trip_starts: "",
    trip_ends: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError("Debes iniciar sesión para crear un grupo");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Usamos ruta relativa '/api/trips' para aprovechar el proxy de Vite
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Cabecera con el token JWT
        },
        body: JSON.stringify({
          group_name: form.group_name,
          trip_starts: form.trip_starts,
          trip_ends: form.trip_ends,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear el grupo");
        return;
      }

      setSuccess("¡Grupo creado correctamente!");
      setForm({
        group_name: "",
        trip_starts: "",
        trip_ends: "",
      });
      setOpen(false);
    } catch {
      setError("No se pudo conectar con el servidor backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "400px" }}>
      <h2>Crear Grupo de Viaje</h2>
      <p>Organiza tus gastos compartidos de forma rápida y sencilla.</p>

      {!token ? (
        <div style={{ padding: "1rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b" }}>
          <p style={{ margin: 0 }}><strong>Acceso restringido:</strong> Debes iniciar sesión para poder crear un grupo de viaje.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Conectado como: <strong>{user?.name || "Usuario"}</strong>
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              cursor: "pointer",
              marginBottom: "1rem"
            }}
          >
            {open ? "Cerrar formulario" : "Agregar grupo"}
          </button>

          {success && <p style={{ color: "green", fontWeight: "600" }}>{success}</p>}
          {error && <p style={{ color: "red", fontWeight: "600" }}>{error}</p>}

          {open && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="group_name" style={{ fontSize: "0.9rem", fontWeight: "600" }}>Nombre del Grupo / Viaje</label>
                <input
                  id="group_name"
                  name="group_name"
                  type="text"
                  placeholder="Ej: Viaje a Mallorca"
                  value={form.group_name}
                  onChange={handleChange}
                  required
                  style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="trip_starts" style={{ fontSize: "0.9rem", fontWeight: "600" }}>Fecha de Inicio</label>
                <input
                  id="trip_starts"
                  name="trip_starts"
                  type="date"
                  value={form.trip_starts}
                  onChange={handleChange}
                  required
                  style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="trip_ends" style={{ fontSize: "0.9rem", fontWeight: "600" }}>Fecha de Fin</label>
                <input
                  id="trip_ends"
                  name="trip_ends"
                  type="date"
                  value={form.trip_ends}
                  onChange={handleChange}
                  required
                  style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.7rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4f46e5",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "0.5rem"
                }}
              >
                {loading ? "Creando grupo..." : "Crear grupo"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Trips;