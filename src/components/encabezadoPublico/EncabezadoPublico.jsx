import { Link, useLocation, useSearchParams } from "wouter";
import { Icono } from "../inicio/IconoInicio";
import useBuscadorZona from "../../hooks/useBuscadorZona";
import "./EncabezadoPublico.css";

const enlaces = [
  { texto: "Inicio", href: "/inicio" },
  { texto: "Comprar", href: "/propiedades-publicas?filter=buy", filtro: "buy" },
  { texto: "Alquilar", href: "/propiedades-publicas?filter=rent", filtro: "rent" },
  { texto: "Contacto", href: "/inicio#contacto" },
];

function BuscadorZona({ filtroActivo }) {
  const { texto, setTexto, abierto, inputRef, buscar, cerrarSiSale, cerrarConEscape } =
    useBuscadorZona(filtroActivo ?? "buy");

  return (
    <form
      className={`EncabezadoPublico__buscar${abierto ? " is-abierto" : ""}`}
      role="search"
      onSubmit={buscar}
      onBlur={cerrarSiSale}
      onKeyDown={cerrarConEscape}
    >
      <label className="EncabezadoPublico__oculto" htmlFor="buscar-zona">
        Buscar por zona
      </label>
      <input
        id="buscar-zona"
        ref={inputRef}
        type="search"
        placeholder="Buscar por zona"
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
      />
      <button type="submit" aria-label="Buscar">
        <Icono name="search" />
      </button>
    </form>
  );
}

export default function EncabezadoPublico({ logo, className = "" }) {
  const [ubicacion] = useLocation();
  const [params] = useSearchParams();
  const filtroActivo = ubicacion === "/propiedades-publicas" ? params.get("filter") || "buy" : null;

  return (
    <header className={`EncabezadoPublico ${className}`}>
      <Link href="/inicio" className="EncabezadoPublico__marca" aria-label="Inicio">
        <img src={logo} alt="Logo de la inmobiliaria" />
      </Link>

      <nav className="EncabezadoPublico__nav" aria-label="Navegación pública">
        {enlaces.map(({ texto, href, filtro }) => (
          <Link key={texto} href={href} className={filtro && filtro === filtroActivo ? "is-active" : ""}>
            {texto}
          </Link>
        ))}
      </nav>

      <div className="EncabezadoPublico__acciones">
        <BuscadorZona filtroActivo={filtroActivo} />
        <Link className="EncabezadoPublico__ingresar" href="/login">
          Ingresar
        </Link>
      </div>
    </header>
  );
}
