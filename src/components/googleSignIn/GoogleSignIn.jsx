import "./GoogleSignIn.css";

import googleIcono from "../../assets/icons/loginGoogle.svg";

export default function GoogleSignIn({ texto, className = "" }) {
  return (
    <div className={`GoogleSignIn ${className}`}>
      <div className="GoogleSignIn__separador">
        <span>{texto}</span>
      </div>

      <button type="button" className="GoogleSignIn__boton">
        <span className="GoogleSignIn__icono">
          <img src={googleIcono} alt="" />
        </span>
        Google
      </button>
    </div>
  );
}
