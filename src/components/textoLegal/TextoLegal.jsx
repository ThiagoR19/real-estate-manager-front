import { Link } from "wouter";

import "./TextoLegal.css";

export default function TextoLegal({ className = "" }) {
  return (
    <p className={`TextoLegal ${className}`}>
      Al ingresar aceptas nuestros {" "}
      <Link href="/terminos" className="TextoLegal__link">
        Términos y políticas de Privacidad
      </Link>
    </p>
  );
}
