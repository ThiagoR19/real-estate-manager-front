import "./PildoraResumen.css";

export default function PildoraResumen({ icon, label, value, tone = "info", onClick, selected = false, disabled = false }) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      className={`pildora-resumen pildora-resumen--${tone}${onClick ? " pildora-resumen--interactive" : ""}${selected ? " is-selected" : ""}`}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-pressed={onClick ? selected : undefined}
      role={onClick ? undefined : "group"}
      aria-label={`${label}: ${value}`}
    >
      <span className="pildora-resumen__icon">
        <img src={icon} alt="" />
      </span>
      <strong className="pildora-resumen__label">{label}</strong>
      <span className="pildora-resumen__value">{value}</span>
    </Element>
  );
}
