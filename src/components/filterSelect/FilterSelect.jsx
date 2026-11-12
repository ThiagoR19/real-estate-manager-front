import "./FilterSelect.css";

import flechaIcono from "../../assets/icons/angle-down-solid-full.svg";

export default function FilterSelect({ id, etiqueta, icono, opciones = [], className = "" }) {
  return (
    <div className={`FilterSelect ${className}`}>
      <span className="FilterSelect__icono">
        <img src={icono} alt="" />
      </span>

      <select id={id} className="FilterSelect__select" aria-label={etiqueta} defaultValue="">
        <option value="" disabled>
          {etiqueta}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>

      <span className="FilterSelect__flecha">
        <img src={flechaIcono} alt="" />
      </span>
    </div>
  );
}
