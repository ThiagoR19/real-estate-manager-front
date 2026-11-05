import { Link, useLocation } from "wouter";

import './LandingNav.css';

import kaikenLogo from '../../assets/icons/kaiken.svg';
import lupaIcono from '../../assets/icons/search.svg';

// "#contacto" lleva al footer de la misma página (ver Footer)
const enlaces = [
    { texto: "Inicio", href: "/home" },
    { texto: "Comprar", href: "/public-properties?filter=buy" },
    { texto: "Alquilar", href: "/public-properties?filter=rent" },
    { texto: "Nosotros", href: "/about-us" },
    { texto: "Contacto", href: "#contacto" }
];

export default function LandingNav({ className = "" }) {
    const [ubicacion] = useLocation();

    const buscar = (e) => {
        e.preventDefault();
    };

    const irAContacto = (e) => {
        e.preventDefault();
        document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header className={`LandingNav ${className}`}>
            <Link href="/home" className='LandingNav__marca' aria-label="Kaiken Propiedades, inicio">
                <img src={kaikenLogo} alt="Kaiken Propiedades" />
            </Link>

            <nav className='LandingNav__nav' aria-label="Navegación principal">
                {enlaces.map(({ texto, href }) => {
                    const activo = href === ubicacion;
                    const clase = `LandingNav__nav-link ${activo ? "LandingNav__nav-link--activo" : ""}`;

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

            <div className='LandingNav__acciones'>
                <form className='LandingNav__buscar' role="search" onSubmit={buscar}>
                    <input
                        type="search"
                        className='LandingNav__buscar-input'
                        placeholder="Buscar por zona"
                        aria-label="Buscar por zona"
                    />

                    <button type="submit" className='LandingNav__buscar-boton' aria-label="Buscar">
                        <img src={lupaIcono} alt="" />
                    </button>
                </form>

                <Link href="/login" className='LandingNav__ingresar' data-sk>Ingresar</Link>
            </div>
        </header>
    )
}
