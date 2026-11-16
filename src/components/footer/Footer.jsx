import { Link } from "wouter";

import "./Footer.css";

import agiLogo from "../../assets/icons/agiLogo.svg";

const navegacion = [
  { texto: "Inicio", href: "/inicio" },
  { texto: "Comprar", href: "/propiedades-publicas?filter=buy" },
  { texto: "Alquilar", href: "/propiedades-publicas?filter=rent" },
  { texto: "Nosotros", href: "/sobre-nosotros" },
  { texto: "Contacto", href: "#contacto" },
];

const legales = [{ texto: "Términos y condiciones", href: "/terminos" }];

function ColumnaEnlaces({ titulo, enlaces }) {
  return (
    <nav className="Footer__columna" aria-label={titulo}>
      <h3 className="Footer__titulo">{titulo}</h3>

      <ul className="Footer__lista">
        {enlaces.map(({ texto, href }) => (
          <li key={texto}>
            {href.startsWith("#") ? (
              <a href={href} className="Footer__enlace">
                {texto}
              </a>
            ) : (
              <Link href={href} className="Footer__enlace">
                {texto}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer({ className = "", anios, URLLogo, inmobiliaria }) {
  const anio = (new Date().getFullYear()) - anios

  return (
    <footer className={`Footer ${className}`} id="contacto" data-sk-fondo>
      <div className="Footer__contenido">
        <div className="Footer__marca">
          <img className="Footer__logo" src={URLLogo} alt="Kaiken Propiedades" />

          <p className="Footer__lema">
            Te acompañamos en cada paso para encontrar el hogar de tus sueños. Trayectoria,
            confianza y seguridad en cada operación
          </p>


          <div className="Footer__redes-hueco" aria-hidden="true" />
        </div>

        <ColumnaEnlaces titulo="Navegación" enlaces={navegacion} />

        <ColumnaEnlaces titulo="Legal & soporte" enlaces={legales} />

        <div className="Footer__hueco" aria-hidden="true" />

        <aside className="Footer__agi">
          <span className="Footer__agi-logo">
            <img src={agiLogo} alt="AGI Propiedades" />
          </span>

          <p className="Footer__agi-texto">
            Esta página y sus portales de autogestión operan bajo <strong>AGI Propiedades</strong>,
            el sistema integral diseñado para simplificar, conectar y potenciar la gestión
            inmobiliaria.
          </p>
        </aside>
      </div>

      <div className="Footer__legal">
        <p className="Footer__copy">
          © {anio} {inmobiliaria}. <span>Todos los derechos reservados.</span>
        </p>

        <p className="Footer__autor">Diseñado y desarrollado por Séptimo Studios.</p>
      </div>
    </footer>
  );
}
