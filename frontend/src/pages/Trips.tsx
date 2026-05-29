import { useState } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import { useTrips, type Member } from "../hooks/useTrips.ts";

type GroupForm = {
  group_name: string;
  trip_starts: string;
  trip_ends: string;
};

const Trips = () => {
  const { user, token } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const {
    trips,
    activeGroupId,
    activeGroupName,
    members,
    searchResults,
    loading,
    error,
    inviteLoading,
    inviteSuccess,
    inviteError,
    selectTrip,
    createTrip,
    searchUsers,
    inviteMember,
  } = useTrips();

  const [form, setForm] = useState<GroupForm>({
    group_name: "",
    trip_starts: "",
    trip_ends: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!activeGroupId) return;
    const link = `${window.location.origin}/join-trip/${activeGroupId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await createTrip(form.group_name, form.trip_starts, form.trip_ends);
    if (success) {
      setForm({ group_name: "", trip_starts: "", trip_ends: "" });
      setOpen(false);
    }
  };

  const handleSearchUsers = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleInviteMember = async (targetUser: Member) => {
    await inviteMember(targetUser);
    setSearchQuery("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Mis Viajes</h2>
        <p className="page-subtitle">
          Crea tus viajes grupales, selecciona uno como activo y gestiona a sus participantes.
        </p>
      </div>

      {!token ? (
        <div className="alert-danger">
          <strong>Acceso restringido:</strong> Debes iniciar sesión para gestionar tus viajes.
        </div>
      ) : (
        <div className="dashboard-grid">

          {/* COLUMNA IZQUIERDA: LISTA Y CREACIÓN DE VIAJES */}
          <div className={`left-column${showPanel ? " hidden" : ""}`}>
            <div className="section-header">
              <h3 className="section-title">Tus Grupos de Viaje</h3>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="btn-secondary"
              >
                {open ? "Cancelar" : "+ Nuevo Viaje"}
              </button>
            </div>

            {open && (
              <form onSubmit={handleSubmit} className="dashboard-form">
                <h4 className="form-title">Agregar Nuevo Viaje</h4>
                {error && <p className="msg-error">{error}</p>}

                <div className="form-group">
                  <label htmlFor="group_name" className="form-label">Nombre del Viaje</label>
                  <input
                    id="group_name"
                    name="group_name"
                    type="text"
                    placeholder="Ej: Escapada a Pirineos"
                    value={form.group_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="trip_starts" className="form-label">Fecha Inicio</label>
                    <input
                      id="trip_starts"
                      name="trip_starts"
                      type="date"
                      value={form.trip_starts}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip_ends" className="form-label">Fecha Fin</label>
                    <input
                      id="trip_ends"
                      name="trip_ends"
                      type="date"
                      value={form.trip_ends}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Creando..." : "Confirmar Viaje"}
                </button>
              </form>
            )}

            {trips.length === 0 ? (
              <p className="empty-state">Aún no tienes viajes creados. ¡Crea uno para empezar!</p>
            ) : (
              <div className="card-list">
                {trips.map((trip) => {
                  const isActive = activeGroupId === trip.group_id;
                  return (
                    <div
                      key={trip.group_id}
                      className={`list-card trip-card${isActive ? " active" : ""}`}
                      onClick={() => {
                        selectTrip(trip);
                        setShowPanel(true);
                      }}
                    >
                      <div>
                        <h4 className="card-title">{trip.group_name}</h4>
                        <p className="card-subtitle">📅 {trip.trip_starts} hasta {trip.trip_ends}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: MIEMBROS E INVITACIONES */}
          <div className={`side-panel${showPanel ? " visible" : ""}`}>

            {/* BOTÓN VOLVER — SOLO VISIBLE CUANDO HAY VIAJE ACTIVO */}
            {activeGroupId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowPanel(false)}
              >
                ← Volver a mis viajes
              </button>
            )}

            {!activeGroupId ? (
              <div className="panel-empty">
                <span className="emoji">🎒</span>
                <p>Selecciona un grupo de viaje de la lista para ver y gestionar sus miembros.</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="panel-header-title">Viaje seleccionado:</h3>
                  <span className="panel-header-value">{activeGroupName}</span>
                </div>

                <hr className="divider" />

                <div>
                  <h4 className="member-section-title">Integrantes del Viaje ({members.length})</h4>
                  <div className="member-list">
                    {members.map((m) => (
                      <div key={m.user_id} className="member-item">
                        <div className="member-avatar">
                          {m.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-info">
                          <span className="member-name">
                            {m.user_name}
                            {m.user_id === user?.id && <span className="member-me">(Tú)</span>}
                          </span>
                          <span className="member-email">{m.user_email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="divider" />

                <div className="left-column">
                  <h4 className="member-section-title">Añadir Amigos al Viaje</h4>

                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o correo..."
                      value={searchQuery}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      className="form-input"
                    />

                    {searchResults.length > 0 && (
                      <div className="search-dropdown">
                        {searchResults.map((su) => (
                          <div key={su.user_id} className="search-result-item">
                            <div className="member-info">
                              <span className="member-name">{su.user_name}</span>
                              <span className="member-email">{su.user_email}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInviteMember(su)}
                              disabled={inviteLoading}
                              className="btn-secondary btn-small"
                            >
                              Agregar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {inviteSuccess && <p className="msg-success">{inviteSuccess}</p>}
                  {inviteError && <p className="msg-error">{inviteError}</p>}

                  <hr className="divider" />

                  <div className="invite-link-section">
                    <h4 className="member-section-title">Enlace de Invitación Compartible</h4>
                    <p className="invite-link-desc">Cualquier persona con este enlace podrá unirse al viaje directamente:</p>
                    <div className="invite-copy-wrapper">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/join-trip/${activeGroupId}`}
                        className="form-input invite-link-input"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="btn-primary btn-copy-link"
                      >
                        {copied ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Trips;