import { Link } from 'wouter';

import './Footer.css';

import kaikenLogo from '../../assets/icons/kaiken.svg';
import agiLogo from '../../assets/icons/agiLogo.svg';
import facebookIcono from '../../assets/icons/redFacebook.svg';
import instagramIcono from '../../assets/icons/redInstagram.svg';
import linkedinIcono from '../../assets/icons/redLinkedin.svg';
import youtubeIcono from '../../assets/icons/redYoutube.svg';
import ubicacionIcono from '../../assets/icons/ubiLlenoIcon.svg';
import telefonoIcono from '../../assets/icons/callIcon.svg';
import correoIcono from '../../assets/icons/mailHomeIcon.svg';
import relojIcono from '../../assets/icons/relojHomeIcon.svg';

const redes = [
    { nombre: "Facebook", icono: facebookIcono, href: "#" },
    { nombre: "Instagram", icono: instagramIcono, href: "#" },
    { nombre: "LinkedIn", icono: linkedinIcono, href: "#" },
    { nombre: "YouTube", icono: youtubeIcono, href: "#" }
];

const navegacion = [
    { texto: "Inicio", href: "/home" },
    { texto: "Comprar", href: "/properties?filter=buy" },
    { texto: "Alquilar", href: "/properties?filter=rent" },
    { texto: "Nosotros", href: "/about-us" },
    { texto: "Contacto", href: "#contacto" }
];

const legales = [
    { texto: "Términos y condiciones", href: "/terms" },
    { texto: "Políticas de privacidad", href: "/terms" }
];

const contacto = [
    { icono: ubicacionIcono, texto: "Bielke 747" },
    { icono: telefonoIcono, texto: "+54 9 2901 6018 01", href: "tel:+5492901601801" },
    { icono: correoIcono, texto: "nahuel.odi.tv@gmail.com", href: "mailto:nahuel.odi.tv@gmail.com" },
    { icono: relojIcono, texto: "Lun a Vie: 9:00 a 20:00 hs" }
];

function ColumnaEnlaces({ titulo, enlaces }) {
    return (
        <nav className='Footer__columna' aria-label={titulo}>
            <h3 className='Footer__titulo'>{titulo}</h3>

            <ul className='Footer__lista'>
                {enlaces.map(({ texto, href }) => (
                    <li key={texto}>
                        {href.startsWith("#")
                            ? <a href={href} className='Footer__enlace'>{texto}</a>
                            : <Link href={href} className='Footer__enlace'>{texto}</Link>}
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default function Footer({ className = "" }) {
    const anio = new Date().getFullYear();

    return (
        <footer className={`Footer ${className}`} id="contacto" data-sk-fondo>
            <div className='Footer__contenido'>

                <div className='Footer__marca'>
                    <img className='Footer__logo' src={kaikenLogo} alt="Kaiken Propiedades" />

                    <p className='Footer__lema'>
                        Te acompañamos en cada paso para encontrar el hogar de tus sueños.
                        Trayectoria, confianza y seguridad en cada operación
                    </p>

                    <ul className='Footer__redes'>
                        {redes.map(({ nombre, icono, href }) => (
                            <li key={nombre}>
                                <a href={href} className='Footer__red' aria-label={nombre}>
                                    <img src={icono} alt="" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <ColumnaEnlaces titulo="Navegación" enlaces={navegacion} />

                <ColumnaEnlaces titulo="Legal & soporte" enlaces={legales} />

                <div className='Footer__columna Footer__columna--contacto'>
                    <h3 className='Footer__titulo'>Contacto</h3>

                    <ul className='Footer__lista'>
                        {contacto.map(({ icono, texto, href }) => (
                            <li key={texto} className='Footer__contacto'>
                                <span className='Footer__contacto-icono'><img src={icono} alt="" /></span>
                                {href ? <a href={href} className='Footer__enlace'>{texto}</a> : texto}
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className='Footer__agi'>
                    <span className='Footer__agi-logo'><img src={agiLogo} alt="AGI Propiedades" /></span>

                    <p className='Footer__agi-texto'>
                        Esta página y sus portales de autogestión operan bajo <strong>AGI Propiedades</strong>,
                        el sistema integral diseñado para simplificar, conectar y potenciar la gestión inmobiliaria.
                    </p>
                </aside>
            </div>

            <div className='Footer__legal'>
                <p className='Footer__copy'>
                    © {anio} KAIKEN PROPIEDADES. <span>Todos los derechos reservados.</span>
                </p>

                <p className='Footer__autor'>Diseñado y desarrollado por Séptimo Studios.</p>
            </div>
        </footer>
    )
}
