import "./PildoraResumen.css";

export default function PildoraResumen({ icon, label, value, tone = "info" }) {
  return (
    <div
      className={`pildora-resumen pildora-resumen--${tone}`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <span className="pildora-resumen__icon">
        <img src={icon} alt="" />
      </span>
      <strong className="pildora-resumen__label">{label}</strong>
      <span className="pildora-resumen__value">{value}</span>
    </div>
  );
}
