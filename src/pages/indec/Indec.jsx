import { useMemo, useState } from "react";
import { angleDownIcon, clockIcon, plusIcon } from "../../assets/icons";
import Button from "../../components/button/Button";
import "./Indec.css";

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const initialRecords = monthNames.map((month, index) => ({ id: index + 1, year: "2024", month, percentage: index < 4 ? "10" : "8.5" }));

export default function Indec() {
  const [year, setYear] = useState("2024");
  const [records, setRecords] = useState(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState("Mayo");
  const [percentage, setPercentage] = useState("");
  const [feedback, setFeedback] = useState("");
  const visibleRecords = useMemo(() => records.filter((record) => record.year === year), [records, year]);

  function addPercentage(event) {
    event.preventDefault();
    if (!percentage || Number(percentage) < 0) return;
    setRecords((current) => [{ id: Date.now(), year, month, percentage: Number(percentage).toLocaleString("es-AR", { maximumFractionDigits: 2 }) }, ...current.filter((record) => !(record.year === year && record.month === month))]);
    setShowForm(false);
    setFeedback(`Porcentaje de ${month} ${year} guardado.`);
    setPercentage("");
    window.setTimeout(() => setFeedback(""), 2800);
  }

  return (
    <main id="indec">
      <div className="indec__topbar">
        <header className="indec__hero"><h1>Indec</h1><p>Tenga un registro de los porcentajes de aumento del indec</p></header>
        <div className="indec__actions"><label className="indec__year"><img src={clockIcon} alt="" /><span className="sr-only">Año</span><select value={year} onChange={(event) => setYear(event.target.value)}><option>2024</option><option>2025</option><option>2026</option></select><img src={angleDownIcon} alt="" /></label><Button className="indec__new-button" icon={plusIcon} text="Nuevo porcentaje" onClick={() => setShowForm(true)} /></div>
      </div>

      <section className="indec__table-card" aria-label="Porcentajes de aumento del INDEC"><div className="indec__table-head"><strong>Mes</strong><strong>Porcentaje</strong></div>{visibleRecords.map((record) => <div className="indec__row" key={record.id}><strong>{record.month}</strong><b>{record.percentage}%</b></div>)}{!visibleRecords.length && <p className="indec__empty">Todavía no hay porcentajes cargados para este año.</p>}</section>
      <p className="indec__feedback" role="status" aria-live="polite">{feedback}</p>

      {showForm && <div className="indec__modal-backdrop" role="presentation" onClick={() => setShowForm(false)}><form className="indec__modal" onSubmit={addPercentage} onClick={(event) => event.stopPropagation()}><button className="indec__modal-close" type="button" onClick={() => setShowForm(false)} aria-label="Cerrar">×</button><h2>Nuevo porcentaje</h2><p>Registrá el aumento mensual informado por INDEC.</p><label>Mes<select value={month} onChange={(event) => setMonth(event.target.value)}>{monthNames.map((item) => <option key={item}>{item}</option>)}</select></label><label>Porcentaje<input type="number" min="0" step="0.01" value={percentage} onChange={(event) => setPercentage(event.target.value)} placeholder="10" required /></label><Button className="indec__save" text="Guardar porcentaje" /></form></div>}
    </main>
  );
}
