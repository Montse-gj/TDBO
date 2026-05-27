import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
// import { NavBar } from "../components/NavBar";

export const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");

    const { login, loading, error, user } = useAuthContext();

    useEffect(() => {
        if (user) {
            const pendingGroupId = localStorage.getItem("pendingJoinGroupId");
            if (pendingGroupId) {
                navigate(`/join-trip/${pendingGroupId}`);
            } else {
                navigate("/trips");
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError("");

        if (!email || !password) {
            setLocalError("Por favor, complete todos los campos");
            return;
        }

        await login(email, password);
    };

    const displayError = localError || error;

    return (
        <>
            <div className="login-wrapper">
                <div className="login-form">
                    <h1><span>L</span><span>og</span><span>in</span></h1>
                    {displayError && <p>{displayError}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" placeholder="tuemail@ejemplo.com" value={email} onChange={(e) => {
                                setEmail(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <div className="">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" placeholder="la palabra que recuerdas" value={password} onChange={(e) => {
                                setPassword(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading}

                            />
                        </div>

                        <button className="" type="submit" disabled={loading}>Login</button>
                        <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
                    </form>

                </div>
                <div className="image-wrapper">
                    <div>
                        <img src="../src/assets/a-new-travel.webp" alt="Logging in to the TDBO website is very easy" />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Login;