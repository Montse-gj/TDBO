import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";

type GroupForm = {
  group_name: string;
  trip_starts: string;
  trip_ends: string;
};

type Group = {
  group_id: number;
  group_name: string;
  created_by: string;
  trip_starts: string;
  trip_ends: string;
};

type Member = {
  user_id: number;
  user_name: string;
  user_email: string;
};

const Page3 = () => {
  const { token, user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [trips, setTrips] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [form, setForm] = useState<GroupForm>({
    group_name: "",
    trip_starts: "",
    trip_ends: "",
  });

  // Cargar grupos del usuario y recuperar grupo activo desde localStorage
  const loadTrips = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Error al cargar viajes:", err);
    }
  };

  useEffect(() => {
    loadTrips();

    const storedActiveId = localStorage.getItem("activeGroupId");
    const storedActiveName = localStorage.getItem("activeGroupName");
    if (storedActiveId) {
      setActiveGroupId(Number(storedActiveId));
    }
    if (storedActiveName) {
      setActiveGroupName(storedActiveName);
    }
  }, [token]);

  // Cargar miembros del grupo activo
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
        // Extraemos los perfiles limpios de los miembros
        const memberList = data.groupMembers.map((m: any) => m.user).filter(Boolean);
        setMembers(memberList);
      }
    } catch (err) {
      console.error("Error al cargar miembros:", err);
    }
  };

  useEffect(() => {
    if (activeGroupId) {
      loadMembers(activeGroupId);
    } else {
      setMembers([]);
    }
  }, [activeGroupId]);

  // Seleccionar un viaje activo
  const handleSelectTrip = (trip: Group) => {
    setActiveGroupId(trip.group_id);
    setActiveGroupName(trip.group_name);
    localStorage.setItem("activeGroupId", String(trip.group_id));
    localStorage.setItem("activeGroupName", trip.group_name);
    setInviteSuccess("");
    setInviteError("");
  };

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
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      loadTrips(); // Recargamos lista de viajes
      
      // Auto-seleccionar el grupo recién creado
      if (data.group) {
        handleSelectTrip(data.group);
      }
    } catch {
      setError("No se pudo conectar con el servidor backend");
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios en tiempo real
  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Invitar a un miembro al viaje activo
  const handleInviteMember = async (targetUser: Member) => {
    if (!activeGroupId || !token) return;

    setInviteLoading(true);
    setInviteSuccess("");
    setInviteError("");

    try {
      const response = await fetch(`/api/trips/${activeGroupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: targetUser.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(data.error || "Error al invitar al usuario");
        return;
      }

      setInviteSuccess(`¡${targetUser.user_name} se ha añadido al viaje!`);
      setSearchQuery("");
      setSearchResults([]);
      loadMembers(activeGroupId); // Refrescar los miembros actuales
    } catch {
      setInviteError("Error al conectar con el servidor");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Sección Header */}
      <div>
        <h2 style={{ fontFamily: "var(--font-menu)", color: "var(--green)", fontSize: "1.8rem", margin: "0 0 0.5rem 0" }}>Mis Viajes</h2>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#666" }}>
          Crea tus viajes grupales, selecciona uno como activo y gestiona a sus participantes.
        </p>
      </div>

      {!token ? (
        <div style={{ padding: "1.5rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "12px", color: "#991b1b" }}>
          <strong>Acceso restringido:</strong> Debes iniciar sesión para gestionar tus viajes.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
          
          {/* COLUMNA IZQUIERDA: LISTA Y CREACIÓN DE VIAJES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Tus Grupos de Viaje</h3>
              
              <button 
                type="button" 
                onClick={() => setOpen((v) => !v)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--light-green)",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {open ? "Cancelar" : "+ Nuevo Viaje"}
              </button>
            </div>

            {/* Formulario de creación de grupos */}
            {open && (
              <form onSubmit={handleSubmit} style={{ padding: "1.5rem", background: "#f9f9f9", borderRadius: "12px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>Agregar Nuevo Viaje</h4>
                {error && <p style={{ color: "red", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="group_name" style={{ fontSize: "0.85rem", fontWeight: "600" }}>Nombre del Viaje</label>
                  <input
                    id="group_name"
                    name="group_name"
                    type="text"
                    placeholder="Ej: Escapada a Pirineos"
                    value={form.group_name}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
                    <label htmlFor="trip_starts" style={{ fontSize: "0.85rem", fontWeight: "600" }}>Fecha Inicio</label>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
                    <label htmlFor="trip_ends" style={{ fontSize: "0.85rem", fontWeight: "600" }}>Fecha Fin</label>
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
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--green)",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Creando..." : "Confirmar Viaje"}
                </button>
              </form>
            )}

            {success && <p style={{ color: "green", fontWeight: "600", margin: 0 }}>{success}</p>}

            {/* Listado de Viajes */}
            {trips.length === 0 ? (
              <p style={{ color: "#888", fontSize: "0.9rem", fontStyle: "italic" }}>Aún no tienes viajes creados. ¡Crea uno para empezar!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {trips.map((trip) => {
                  const isActive = activeGroupId === trip.group_id;
                  return (
                    <div 
                      key={trip.group_id}
                      onClick={() => handleSelectTrip(trip)}
                      style={{
                        padding: "1rem 1.2rem",
                        borderRadius: "12px",
                        border: isActive ? "2px solid var(--green)" : "1px solid #e5e5e5",
                        background: isActive ? "rgba(82, 112, 72, 0.05)" : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 0.3rem 0", color: isActive ? "var(--green)" : "#333", fontSize: "1.1rem" }}>{trip.group_name}</h4>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#777" }}>
                          📅 {trip.trip_starts} hasta {trip.trip_ends}
                        </p>
                      </div>
                      <span 
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "20px",
                          background: isActive ? "var(--green)" : "#f0f0f0",
                          color: isActive ? "#fff" : "#666"
                        }}
                      >
                        {isActive ? "Viaje Activo" : "Seleccionar"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: MIEMBROS E INVITACIONES DEL VIAJE ACTIVO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem", background: "#fdfdfd", borderRadius: "16px", border: "1px solid #f0f0f0", minHeight: "300px" }}>
            {!activeGroupId ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#999", gap: "0.5rem", textAlign: "center", padding: "2rem" }}>
                <span style={{ fontSize: "2rem" }}>🎒</span>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>Selecciona un grupo de viaje de la lista para ver y gestionar sus miembros.</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.2rem", color: "#333" }}>Viaje seleccionado:</h3>
                  <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--green)" }}>{activeGroupName}</span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0.5rem 0" }} />

                {/* Listado de Miembros del Viaje */}
                <div>
                  <h4 style={{ margin: "0 0 0.8rem 0", fontSize: "0.95rem", fontWeight: "600", color: "#555" }}>Integrantes del Viaje ({members.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {members.map((m) => (
                      <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.4rem 0" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "var(--green)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.8rem"
                        }}>
                          {m.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#333" }}>
                            {m.user_name} {m.user_id === user?.id && <span style={{ fontSize: "0.75rem", color: "#777", fontWeight: "normal" }}>(Tú)</span>}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#999" }}>{m.user_email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0.5rem 0" }} />

                {/* Invitación de nuevos miembros */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#555" }}>Añadir Amigos al Viaje</h4>
                  
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o correo..."
                      value={searchQuery}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "0.85rem"
                      }}
                    />

                    {/* Resultados de búsqueda flotantes */}
                    {searchResults.length > 0 && (
                      <div style={{
                        position: "absolute",
                        top: "105%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        maxHeight: "180px",
                        overflowY: "auto"
                      }}>
                        {searchResults.map((su) => (
                          <div 
                            key={su.user_id}
                            style={{
                              padding: "0.6rem 0.8rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid #f9f9f9",
                              cursor: "pointer"
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{su.user_name}</span>
                              <span style={{ fontSize: "0.75rem", color: "#888" }}>{su.user_email}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInviteMember(su)}
                              disabled={inviteLoading}
                              style={{
                                padding: "0.3rem 0.6rem",
                                borderRadius: "6px",
                                border: "none",
                                background: "var(--light-green)",
                                color: "#fff",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              Agregar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {inviteSuccess && <p style={{ color: "green", fontSize: "0.8rem", fontWeight: "600", margin: 0 }}>{inviteSuccess}</p>}
                  {inviteError && <p style={{ color: "red", fontSize: "0.8rem", fontWeight: "600", margin: 0 }}>{inviteError}</p>}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Page3;