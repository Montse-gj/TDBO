import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import '../styles/index.css';
import '../styles/NavBar.css';

export const NavBar = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/home')}>
                    <img src={logo} alt="TDBO logo" />
                </div>

                <div className="navbar-menu">

                    
                    <div className={`drawer ${menuOpen ? 'drawer--open' : ''}`}>
                        <ul className="drawer-menu">
                            {user && (
                                <>
                                    <li>
                                        <NavLink to="/page3" className={({ isActive }) => "navbar-link" + (isActive ? " navbar-link--active" : "")} onClick={() => setMenuOpen(false)}>
                                            Viajes
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/page4" className={({ isActive }) => "navbar-link" + (isActive ? " navbar-link--active" : "")} onClick={() => setMenuOpen(false)}>
                                            Gastos
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/page5" className={({ isActive }) => "navbar-link" + (isActive ? " navbar-link--active" : "")} onClick={() => setMenuOpen(false)}>
                                            Saldos
                                        </NavLink>
                                    </li>
                                </>
                            )}
                            {user ? (
                                <div className="navbar-user-panel">
                                    <span className="user-welcome">Hola, <strong className="user-name">{user.name}</strong></span>
                                    <NavLink to="/user" className={({ isActive }) => "navbar-avatar-btn" + (isActive ? " navbar-avatar-btn--active" : "")} onClick={() => setMenuOpen(false)}>
                                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                    </NavLink>
                                    <button className="btn-logout" onClick={handleLogout}>
                                        <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                <div className="navbar-auth-buttons">
                                    <NavLink to="/register" className="btn-auth btn-auth--register" onClick={() => setMenuOpen(false)}>
                                        Registro
                                    </NavLink>
                                    <NavLink to="/login" className="btn-auth btn-auth--login" onClick={() => setMenuOpen(false)}>
                                        Iniciar Sesión
                                    </NavLink>
                                </div>
                            )}
                        </ul>
                    </div>

                    <button
                        className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Abrir menú"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>
            </div>
        </nav>
    );
};

export default NavBar;