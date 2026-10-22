import { Link, useLocation } from 'wouter';

import './NavLanding.css';

import kaikenLogo from '../../assets/icons/kaiken.svg';
import lupaIcono from '../../assets/icons/search.svg';

// "#contacto" lleva al footer de la misma página (ver Footer)
const enlaces = [
    { texto: "Inicio", href: "/home" },
    { texto: "Comprar", href: "#" },
    { texto: "Alquilar", href: "#" },
    { texto: "Nosotros", href: "/about-us" },
    { texto: "Contacto", href: "#contacto" }
];

export default function NavLanding({ className = "" }) {
    const [ubicacion] = useLocation();

    const buscar = (e) => {
        e.preventDefault();
    };

    const irAContacto = (e) => {
        e.preventDefault();
        document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header className={`NavLanding ${className}`}>
            <Link href="/home" className='NavLanding__marca' aria-label="Kaiken Propiedades, inicio">
                <img src={kaikenLogo} alt="Kaiken Propiedades" />
            </Link>

            <nav className='NavLanding__nav' aria-label="Navegación principal">
                {enlaces.map(({ texto, href }) => {
                    const activo = href === ubicacion;
                    const clase = `NavLanding__nav-link ${activo ? "NavLanding__nav-link--activo" : ""}`;

                    return href.startsWith("#") ? (
                        <a
                            key={texto}
                            href={href}
                            className={clase}
                            onClick={href === "#contacto" ? irAContacto : undefined}
                        >
                            {texto}
                        </a>
                    ) : (
                        <Link key={texto} href={href} className={clase} aria-current={activo ? "page" : undefined}>
                            {texto}
                        </Link>
                    );
                })}
            </nav>

            <div className='NavLanding__acciones'>
                <form className='NavLanding__buscar' role="search" onSubmit={buscar}>
                    <input
                        type="search"
                        className='NavLanding__buscar-input'
                        placeholder="Buscar por zona"
                        aria-label="Buscar por zona"
                    />

                    <button type="submit" className='NavLanding__buscar-boton' aria-label="Buscar">
                        <img src={lupaIcono} alt="" />
                    </button>
                </form>

                <Link href="/login" className='NavLanding__ingresar' data-sk>Ingresar</Link>
            </div>
        </header>
    )
}
