import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuthContext();
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [errorTrips, setErrorTrips] = useState(null);


    type Trip = {
        group_id: number;
        group_name: string;
        trip_starts: string;
        trip_ends: string;
    };

    const [trips, setTrips] = useState<Trip[]>([]);
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
                            key={trip.group_id}
                            onClick={() => navigate(`/trip/${trip.group_id}/members`)}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                margin: "0.5rem 0",
                                cursor: "pointer"
                            }}
                        >
                            <h3>{trip.group_name}</h3>
                            {trip.trip_ends && new Date(trip.trip_ends) < new Date() && (
    <span style={{ color: "red" }}> (Finalizado)</span>
)}
                            <p>Inicio el: {trip.trip_starts}</p>
                            <p>Termina el: {trip.trip_ends}</p>
                            {/* <p>Miembros: {trip.members || 0}</p> */}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
export default Dashboard;