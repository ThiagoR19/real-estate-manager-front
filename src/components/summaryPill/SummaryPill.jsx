import "./SummaryPill.css";

export default function SummaryPill({ icon, label, value, tone = "info" }) {
  return (
    <div className={`summary-pill summary-pill--${tone}`} role="group" aria-label={`${label}: ${value}`}>
      <span className="summary-pill__icon"><img src={icon} alt="" /></span>
      <strong className="summary-pill__label">{label}</strong>
      <span className="summary-pill__value">{value}</span>
    </div>
  );
}
