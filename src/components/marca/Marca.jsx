import "./Marca.css";

import { agiLogo } from "../../assets/icons";

export default function Marca({ oscura = false, className = "" }) {
  return (
    <div className={`Marca ${oscura ? "Marca--oscura" : ""} ${className}`}>
      <span className="Marca__logo">
        <img src={agiLogo} alt="Logo AGI" />
      </span>
      <span className="Marca__nombre">AGI</span>
      <span className="Marca__sub">Propiedades</span>
    </div>
  );
}
