import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";
import "../styles/dashboard.css";

export const JoinTripPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [groupName, setGroupName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [joining, setJoining] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // 1. Verificar autenticación. Si no está logueado, redirigir a Login
  useEffect(() => {
    if (!token && tripId) {
      // Guardamos el tripId en localStorage bajo la clave "pendingJoinGroupId"
      // para que Login.tsx / Register.tsx detecten la invitación pendiente tras autenticarse
      localStorage.setItem("pendingJoinGroupId", tripId);
      navigate("/login");
    }
  }, [token, tripId, navigate]);

  // 2. Obtener información pública del viaje (nombre) si está logueado
  useEffect(() => {
    const fetchPublicInfo = async () => {
      if (!token || !tripId) return;

      try {
        const response = await fetch(`/api/trips/${tripId}/public-info`);
        if (response.ok) {
          const data = await response.json();
          // El backend puede retornar "group_name" o "name" según el mapeo
          setGroupName(data.group_name || data.name || "");
        } else {
          setErrorMsg("El viaje especificado no existe o ha sido eliminado.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error de conexión al obtener la información del viaje.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicInfo();
  }, [token, tripId]);

  // 3. Confirmar y unirse al viaje
  const handleConfirmJoin = async () => {
    if (!token || !tripId) return;

    setJoining(true);
    setErrorMsg("");
    try {
      const response = await fetch(`/api/trips/${tripId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Guardar el viaje como activo automáticamente
        localStorage.setItem("activeGroupId", String(tripId));
        localStorage.setItem("activeGroupName", groupName || data.group?.group_name || "Viaje");
        // Limpiar la invitación pendiente
        localStorage.removeItem("pendingJoinGroupId");

        // Redirigir al panel de viajes tras un breve delay
        setTimeout(() => {
          navigate("/trips");
        }, 1500);
      } else {
        setErrorMsg(data.error || "No se pudo unir al viaje.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setJoining(false);
    }
  };

  if (!token) {
    return null; // Redireccionando en el useEffect...
  }

  if (loading) {
    return (
      <div className="join-trip-container">
        <div className="join-trip-card loading-state">
          <div className="spinner"></div>
          <p className="loading-text">Cargando detalles del viaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="join-trip-container">
      <div className="join-trip-card">
        {success ? (
          <div className="status-flow success">
            <span className="success-emoji">🎉</span>
            <h2>¡Te has unido con éxito!</h2>
            <p>Ya eres miembro del viaje <strong>{groupName || "seleccionado"}</strong>.</p>
            <p className="redirect-note">Redirigiéndote al panel de viajes...</p>
          </div>
        ) : (
          <div className="status-flow invite-prompt">
            <span className="invite-emoji">🎒</span>
            <div className="invite-badge">Invitación de Viaje</div>
            <h1>¿Quieres unirte al viaje?</h1>

            {errorMsg ? (
              <div className="msg-error-display">
                <p>{errorMsg}</p>
                <Link to="/trips" className="btn-outline" style={{ marginTop: "1rem", display: "inline-block" }}>
                  Ir a mis viajes
                </Link>
              </div>
            ) : (
              <>
                <p className="invite-desc">
                  Has sido invitado a participar en <strong>{groupName || "este viaje"}</strong> en TDBO para compartir gastos y balances.
                </p>

                <div className="action-buttons" style={{ marginTop: "1.5rem" }}>
                  <button
                    onClick={handleConfirmJoin}
                    disabled={joining}
                    className="btn-primary btn-join-action"
                  >
                    {joining ? "Uniéndote..." : "Confirmar y Unirme"}
                  </button>
                  <button
                    onClick={() => navigate("/trips")}
                    disabled={joining}
                    className="btn-outline btn-join-action"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTripPage;
