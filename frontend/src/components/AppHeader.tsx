import { NavLink } from 'react-router-dom';

const AppHeader = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li>
                    <NavLink to="/home" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/login" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Login
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/register" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Registro
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/page3" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Page3
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/page4" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Page4
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/page5" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        Page5
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/user" className={({ isActive }) => "nav-btn" + (isActive ? " nav-btn--active" : "")} >
                        User
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default AppHeader;