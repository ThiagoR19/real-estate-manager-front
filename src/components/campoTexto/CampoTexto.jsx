import { useState } from "react";

import "./CampoTexto.css";

import ojoIcono from "../../assets/icons/loginEye.svg";
import ojoTachadoIcono from "../../assets/icons/loginLockEye.svg";

export default function CampoTexto({
  id,
  label,
  tipo = "text",
  placeholder,
  icono,
  autoComplete,
  conOjo = false,
  className = "",
  children,
  required = false,
  minLength,
  maxLength,
  inputMode,
  pattern,
  defaultValue,
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className={`CampoTexto ${className}`}>
      <label htmlFor={id} className="CampoTexto__label">
        {label}
      </label>

      <div className="CampoTexto__contenedor">
        <span className="CampoTexto__icono">
          <img src={icono} alt="" />
        </span>

        <input
          id={id}
          name={id}
          type={conOjo && mostrar ? "text" : tipo}
          className={`CampoTexto__input ${conOjo ? "CampoTexto__input--ojo" : ""}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          inputMode={inputMode}
          pattern={pattern}
          defaultValue={defaultValue}
        />

        {conOjo && (
          <button
            type="button"
            className="CampoTexto__ojo"
            onClick={() => setMostrar(!mostrar)}
            aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <img src={mostrar ? ojoTachadoIcono : ojoIcono} alt="" />
          </button>
        )}
      </div>

      {children}
    </div>
  );
}
