import { useState } from "react";

type GroupForm = {
  group_id: string;
  group_name: string;
  created_by: string;
  trip_starts: string;
  trip_ends: string;
};

const Page3 = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<GroupForm>({
    group_id: "",
    group_name: "",
    created_by: "",
    trip_starts: "",
    trip_ends: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "group_id"
          ? e.target.value.replace(/\D/g, "")
          : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: Number(form.group_id),
          group_name: form.group_name,
          created_by: form.created_by,
          trip_starts: form.trip_starts,
          trip_ends: form.trip_ends,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear el grupo");
        return;
      }

      setSuccess("Grupo creado correctamente");
      setForm({
        group_id: "",
        group_name: "",
        created_by: "",
        trip_starts: "",
        trip_ends: "",
      });
      setOpen(false);
    } catch {
      setError("No se pudo conectar con el backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Page 3</h2>
      <p>Content</p>

      <button type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Cerrar formulario" : "Agregar grupo"}
      </button>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {open && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="group_id">Group ID</label>
            <input
              id="group_id"
              name="group_id"
              type="number"
              value={form.group_id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="group_name">Group name</label>
            <input
              id="group_name"
              name="group_name"
              type="text"
              value={form.group_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="created_by">Created by</label>
            <input
              id="created_by"
              name="created_by"
              type="text"
              value={form.created_by}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="trip_starts">Trip starts</label>
            <input
              id="trip_starts"
              name="trip_starts"
              type="date"
              value={form.trip_starts}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="trip_ends">Trip ends</label>
            <input
              id="trip_ends"
              name="trip_ends"
              type="date"
              value={form.trip_ends}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear grupo"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Page3;