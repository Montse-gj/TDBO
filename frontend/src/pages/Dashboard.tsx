import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuthContext();
    const [trips, setTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [errorTrips, setErrorTrips] = useState(null);

    // Redirigir si no hay usuario
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // Cargar viajes al montar el componente
    useEffect(() => {
        const fetchTrips = async () => {
            setLoadingTrips(true);
            setErrorTrips(null);
            try {
                const response = await fetch("/api/trips", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error("Error al cargar los viajes");
                }
                const data = await response.json();
                setTrips(data);
            } catch (error) {
                setErrorTrips(error.message);
            } finally {
                setLoadingTrips(false);
            }
        };

        if (user) {
            fetchTrips();
        }
    }, [user, token]);

    return (
        <>
            <h2>Mis viajes</h2>

            <button onClick={() => navigate("/trips")}>
                + Crear nuevo viaje
            </button>

            {loadingTrips && <p>Cargando viajes...</p>}

            {errorTrips && <p style={{ color: "red" }}>Error: {errorTrips}</p>}

            {!loadingTrips && !errorTrips && trips.length === 0 && (
                <p>No tienes viajes. Crea uno nuevo.</p>
            )}

            {!loadingTrips && !errorTrips && trips.length > 0 && (
                <div>
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                margin: "0.5rem 0",
                                cursor: "pointer"
                            }}
                        >
                            <h3>{trip.name}</h3>
                            <p>Creado el: {trip.createdAt}</p>
                            <p>Miembros: {trip.membersCount || 0}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
export default Dashboard;