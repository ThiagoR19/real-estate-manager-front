import "./FiltroSelect.css";

import { angleDownIcon } from "../../assets/icons";

const normalizar = (opcion) => (typeof opcion === "string" ? { texto: opcion, valor: opcion } : opcion);

export default function FiltroSelect({ id, name, etiqueta, icono, opciones = [], className = "" }) {
  return (
    <div className={`FiltroSelect ${className}`}>
      <span className="FiltroSelect__icono">
        <img src={icono} alt="" />
      </span>

      <select id={id} name={name} className="FiltroSelect__select" aria-label={etiqueta} defaultValue="">
        <option value="" disabled>
          {etiqueta}
        </option>
        {opciones.map(normalizar).map(({ texto, valor }) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>

      <span className="FiltroSelect__flecha">
        <img src={angleDownIcon} alt="" />
      </span>
    </div>
  );
}
