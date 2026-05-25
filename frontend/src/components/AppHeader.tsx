import { NavLink } from "react-router-dom";
import "../styles/NavBar.css";

const AppHeader = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Login
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Registro
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Gastos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/page5"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Saldos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user"
            className={({ isActive }) =>
              "nav-btn" + (isActive ? " nav-btn--active" : "")
            }
          >
            Perfil
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default AppHeader;
