import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
// import { NavBar } from "../components/NavBar";


export const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [localError, setLocalError] = useState("");

    const { register, loading, error, user } = useAuthContext();

    useEffect(() => {
        if (user) {
            navigate("/trips");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError("");

        if (!name || !email || !password || !confirmPassword) {
            setLocalError("Por favor, complete todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Las contraseñas no coinciden");
            return;
        }

        await register(name, email, password);
    };

    const displayError = localError || error;

    return (
        <>
            <div className="register-wrapper">
                <div className="register-form">
                    <h1><span>Re</span><span>gis</span><span>tro</span></h1>
                    {displayError && <p>{displayError}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="">
                            <label htmlFor="name">Nombre:</label>
                            <input type="text" id="name" placeholder="Alicia Rodríguez" value={name} onChange={(e) => {
                                setName(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <div className="">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" placeholder="tuemail@ejemplo.com" value={email} onChange={(e) => {
                                setEmail(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <div className="">
                            <label htmlFor="password">Contraseña:</label>
                            <input type="password" id="password"  placeholder="Algo que recuerdes" value={password} onChange={(e) => {
                                setPassword(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <div className="">
                            <label htmlFor="confirmPassword">Confirmar contraseña:</label>
                            <input type="password" id="confirmPassword" placeholder="Repite la contraseña" value={confirmPassword} onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <button className="" type="submit" disabled={loading}>Registro</button>
                        <p>
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>
                </div>
                <div className="image-wrapper">
                    <div>
                    <img src="../src/assets/smiling-people.webp" />
                </div>
                </div>
            </div>
        </>
    );
};
export default Register;