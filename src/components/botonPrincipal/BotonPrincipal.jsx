import "./BotonPrincipal.css";

import flechaIcono from "../../assets/icons/loginArrow.svg";
import avionIcono from "../../assets/icons/paper-plane-regular-full.svg";
import checkIcono from "../../assets/icons/check-solid-full.svg";

// estado: "inactivo" | "enviando" | "listo"
export default function BotonPrincipal({
  texto,
  textoEnviando = "Enviando",
  textoListo = "¡Listo!",
  estado = "inactivo",
  tipo = "submit",
  className = "",
}) {
  const ocupado = estado !== "inactivo";

  return (
    <button
      type={tipo}
      className={`BotonPrincipal BotonPrincipal--${estado} ${className}`}
      disabled={ocupado}
      aria-busy={estado === "enviando"}
    >
      <span className="BotonPrincipal__progreso"></span>

      <span className="BotonPrincipal__capa BotonPrincipal__capa--inactivo" aria-hidden={ocupado}>
        {texto}
        <span className="BotonPrincipal__icono">
          <img src={flechaIcono} alt="" />
        </span>
      </span>

      <span
        className="BotonPrincipal__capa BotonPrincipal__capa--enviando"
        aria-hidden={estado !== "enviando"}
      >
        <span className="BotonPrincipal__avion">
          <img src={avionIcono} alt="" />
        </span>
        {textoEnviando}
        <span className="BotonPrincipal__puntos">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </span>

      <span
        className="BotonPrincipal__capa BotonPrincipal__capa--listo"
        aria-hidden={estado !== "listo"}
      >
        <span className="BotonPrincipal__check">
          <img src={checkIcono} alt="" />
        </span>
        {textoListo}
      </span>
    </button>
  );
}
