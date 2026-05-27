import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import "../styles/Home.css";

const Home = () => {
    return (
        <div className="landing-container">
            
            <section className="hero-section">
                <h1 className="hero-title">
                    Cuentas <span>simples...</span><br />
                    Viajes <span>inolvidables.</span>
                </h1>
                <p className="hero-subtitle">
                    Organizar las cuentas de tus viajes nunca ha sido tan sencillo. Comparte los gastos con tus amigos y deja de perseguir Bizums (porque eso nunca fue una opción).
                </p>
                <Link to="/register" className="hero-cta">
                    Empezar ahora
                </Link>
                
                <div className="hero-image-wrapper">
                    <img src="../src/assets/hero-friends.webp" alt="Amigos de viaje" />
                </div>
            </section>
            
            <section className="features-section">
                <h2 className="section-title">Disfruta con tu gente,<br /><span>divide gastos sin dramas</span></h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">Gastos claros</h3>
                        <p className="feature-desc">Registra cada pago en segundos. Olvídate de los tickets arrugados y las hojas de cálculo confusas.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">División inteligente</h3>
                        <p className="feature-desc">Divide en partes iguales, por porcentajes o montos personalizados. Tú decides cómo se reparte el gasto.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">Saldos automáticos</h3>
                        <p className="feature-desc">TDBO calcula quién le debe a quién en tiempo real, minimizando el número de transferencias necesarias.</p>
                    </div>
                </div>
            </section>
            
            <section className="how-it-works">
                <h2 className="section-title">¿Cómo funciona?</h2>
                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number one">1</div>
                        <div className="step-content travel">
                            <h3 className="step-title">Crea tu viaje</h3>
                            <p className="step-desc">Añade un destino, las fechas y dales la bienvenida a tus amigos de viaje a través de un enlace de invitación.</p>
                        </div>
                    </div>
                    
                    <div className="step-item">
                        <div className="step-number two">2</div>
                        <div className="step-content register">
                            <h3 className="step-title">Registra los gastos</h3>
                            <p className="step-desc">Vuelos, alojamientos, cenas... Cada vez que alguien pague algo, anótalo en TDBO al instante.</p>
                        </div>
                    </div>
                    
                    <div className="step-item">
                        <div className="step-number three">3</div>
                        <div className="step-content relax">
                            <h3 className="step-title">Relájate y disfruta</h3>
                            <p className="step-desc">Nosotros hacemos las matemáticas. Al final del viaje, sabrás exactamente quién debe pagar a quién para saldar las cuentas.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <hr />
                <div className="footer-content">
                    <img src={logo} alt="TDBO Logo" className="footer-logo" />
                    <div className="footer-links">
                        <Link to="/login">Iniciar sesión</Link>
                        <Link to="/register">Registro</Link>
                    </div>
                    
                </div>
            </footer>
        </div>
    );
};

export default Home;