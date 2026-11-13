import "./AccesoGoogle.css";

import googleIcono from "../../assets/icons/loginGoogle.svg";

export default function AccesoGoogle({ texto, className = "" }) {
  return (
    <div className={`AccesoGoogle ${className}`}>
      <div className="AccesoGoogle__separador">
        <span>{texto}</span>
      </div>

      <button type="button" className="AccesoGoogle__boton">
        <span className="AccesoGoogle__icono">
          <img src={googleIcono} alt="" />
        </span>
        Google
      </button>
    </div>
  );
}
