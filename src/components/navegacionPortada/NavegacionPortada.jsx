import { Link, useLocation } from "wouter";

import "./NavegacionPortada.css";

import lupaIcono from "../../assets/icons/search.svg";

// "#contacto" lleva al footer de la misma página (ver Footer)
const enlaces = [
  { texto: "Inicio", href: "/inicio" },
  { texto: "Comprar", href: "/propiedades-publicas?filter=buy" },
  { texto: "Alquilar", href: "/propiedades-publicas?filter=rent" },
  { texto: "Nosotros", href: "/sobre-nosotros" },
  { texto: "Contacto", href: "#contacto" },
];

export default function NavegacionPortada({ className = "", URLLogo }) {
  const [ubicacion] = useLocation();

  const buscar = (e) => {
    e.preventDefault();
  };

  const irAContacto = (e) => {
    e.preventDefault();
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`NavegacionPortada ${className}`}>
      <Link href="/inicio" className="NavegacionPortada__marca" aria-label="Kaiken Propiedades, inicio">
        <img src={URLLogo} alt="Logo" />
      </Link>

      <nav className="NavegacionPortada__nav" aria-label="Navegación principal">
        {enlaces.map(({ texto, href }) => {
          const activo = href === ubicacion;
          const clase = `NavegacionPortada__nav-link ${activo ? "NavegacionPortada__nav-link--activo" : ""}`;

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
            <Link
              key={texto}
              href={href}
              className={clase}
              aria-current={activo ? "page" : undefined}
            >
              {texto}
            </Link>
          );
        })}
      </nav>

      <div className="NavegacionPortada__acciones">
        <form className="NavegacionPortada__buscar" role="search" onSubmit={buscar}>
          <input
            type="search"
            className="NavegacionPortada__buscar-input"
            placeholder="Buscar por zona"
            aria-label="Buscar por zona"
          />

          <button type="submit" className="NavegacionPortada__buscar-boton" aria-label="Buscar">
            <img src={lupaIcono} alt="" />
          </button>
        </form>

        <Link href="/login" className="NavegacionPortada__ingresar" data-sk>
          Ingresar
        </Link>
      </div>
    </header>
  );
}
