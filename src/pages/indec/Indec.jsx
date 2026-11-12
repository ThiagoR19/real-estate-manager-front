import { useEffect, useState } from "react";
import { angleDownIcon, clockIcon, plusIcon } from "../../assets/icons";
import { Button, IncreaseModal } from "../../components";
import "./Indec.css";
import { api } from "../../services/api";

export default function Indec() {
  const [year, setYear] = useState("2024");
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  function addPercentage({ year: recordYear, month, percentage }) {
    if (percentage === "" || !Number.isFinite(Number(percentage)) || Number(percentage) < 0) return;
    setRecords((current) => [
      {
        id: Date.now(),
        year: recordYear,
        month,
        percentage: Number(percentage).toLocaleString("es-AR", { maximumFractionDigits: 2 }),
      },
      ...current.filter((record) => !(record.year === recordYear && record.month === month)),
    ]);
    setYear(recordYear);
    setShowForm(false);
    setFeedback(`Porcentaje de ${month} ${recordYear} guardado.`);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  useEffect(() => {
    async function getIndec() {
      setRecords(await api.indec());
      console.log(await api.indec());
    }
    getIndec();
  }, []);

  return (
    <main id="indec">
      <div className="indec__topbar">
        <header className="indec__hero">
          <h1>Indec</h1>
          <p>Tenga un registro de los porcentajes de aumento del indec</p>
        </header>
        <div className="indec__actions">
          <Button
            className="indec__new-button"
            icon={plusIcon}
            text="Nuevo porcentaje"
            onClick={() => setShowForm(true)}
          />
          <label className="indec__year">
            <img src={clockIcon} alt="" />
            <span className="sr-only">Año</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {[...new Set(["2024", "2025", "2026", ...records.map((record) => record.year)])]
                .sort()
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
            <img src={angleDownIcon} alt="" />
          </label>
        </div>
      </div>

      <section className="indec__table-card" aria-label="Porcentajes de aumento del INDEC">
        <div className="indec__table-head">
          <strong>Mes</strong>
          <strong>Porcentaje</strong>
        </div>
        {records.map((record) => (
          <div className="indec__row" key={record.id}>
            <strong>{record.month}</strong>
            <b>{record.percentage}%</b>
          </div>
        ))}
        {!records.length && (
          <p className="indec__empty">Todavía no hay porcentajes cargados para este año.</p>
        )}
      </section>

      {feedback && (
        <p className="indec__feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
      {showForm && (
        <IncreaseModal year={year} onClose={() => setShowForm(false)} onSubmit={addPercentage} />
      )}
    </main>
  );
}
