import React from "react"; //comentarios
import "./navbar.css";//
const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                Alejandro Gutierrez
            </div>
            <ul className="navbar-links">  
                <li><a href="inicio">Inicio</a></li>
                <li><a href="servicio">Servicio</a></li>
                <li><a href="portafolio">Portafolio</a></li>
                <li><a href="Contacto">Contact</a></li>
                <li>
                    <a href="login" className="login-btn">
                        Login

                    </a>
                    
                </li>


            </ul>
        </nav>
    );

};
export default Navbar;