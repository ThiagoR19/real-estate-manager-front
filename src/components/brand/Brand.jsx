import "./Brand.css";

import logoIcono from "../../assets/icons/agiLogo.svg";

export default function Brand({ oscura = false, className = "" }) {
  return (
    <div className={`Brand ${oscura ? "Brand--oscura" : ""} ${className}`}>
      <span className="Brand__logo">
        <img src={logoIcono} alt="Logo AGI" />
      </span>

      <span className="Brand__nombre">AGI</span>

      <span className="Brand__sub">Propiedades</span>
    </div>
  );
}
