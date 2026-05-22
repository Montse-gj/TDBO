import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "../types/types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Cargar el usuario y el token desde el almacenamiento local
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (user && token) {
            setUser(JSON.parse(user));
            setToken(token);
        }

    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError("Error al iniciar sesión");
        }
        setLoading(false);
    }
    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, password }),
                });
            const data = await response.json();
            if (response.ok) {
                await login(email, password);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError("Error al registrar el usuario");
        }
        setLoading(false);
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setError(null);
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }
    return context;
};
