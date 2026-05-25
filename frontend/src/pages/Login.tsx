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
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          
            <div className="">
                <div className="">
                    <h1>Login</h1>
                    {displayError && <p>{displayError}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" value={email} onChange={(e) => {
                                setEmail(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading} />
                        </div>
                        <div className="">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" value={password} onChange={(e) => {
                                setPassword(e.target.value)
                                setLocalError("")
                            }}
                                disabled={loading}

                            />
                        </div>

                        <button className="" type="submit" disabled={loading}>Login</button>
                    </form>
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
                </div>
            </div>
        </>
    )

}
export default Login;