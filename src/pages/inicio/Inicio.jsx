import rect from "react";
import "./Inicio.css";

const Inicio = () => {
    return ( 
        <main className="inicio">

            {/*HERO*/}
            <section className="hero">
                <h1>Bienvenido a Nuestro sitio</h1>
                <p>
                    
                    Creamos soluciones tecnoligicas modernas para empresas
                
                </p>
                <button>Conocer mas</button>
            </section>

            <section className="sevicios">
                <h2>Nuestros Servicios</h2>
                <div className="servicios-container">
                    <div className="card1">
                        <h3>Desarrollo Web</h3>
                        <p>Construimos sitios web modernos y responsivos.</p>
                    </div>
                    <div className="card2">
                        <h3>Aplicaciones Backend</h3>
                        <p>Desarrollamos servidores APIs con Node.js.</p>
                    </div>
                    <div className="card3">
                        <h3> Bases de datos</h3>
                        <p>Diseñamos y gestion de bases de datos eficientes.</p>
                    </div>
                </div>
            </section>
            {/*Llamada a la accion*/}
            <section className="cta">
                <h2>¡Tienes un proyecto en mente?</h2>
                <p>Contáctanos y te ayudaremos a hacerlo realidad.</p>
                <button>Contactar</button>
            </section>
        </main>
     ) ;
};

export default Inicio;