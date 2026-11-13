import "./FiltroSelect.css";

import flechaIcono from "../../assets/icons/angle-down-solid-full.svg";

export default function FiltroSelect({ id, etiqueta, icono, opciones = [], className = "" }) {
  return (
    <div className={`FiltroSelect ${className}`}>
      <span className="FiltroSelect__icono">
        <img src={icono} alt="" />
      </span>

      <select id={id} className="FiltroSelect__select" aria-label={etiqueta} defaultValue="">
        <option value="" disabled>
          {etiqueta}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>

      <span className="FiltroSelect__flecha">
        <img src={flechaIcono} alt="" />
      </span>
    </div>
  );
}
