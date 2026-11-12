import { useEffect, useState } from "react";
import { angleDownIcon, clockIcon, plusIcon } from "../../assets/icons";
import { Button, IncreaseModal } from "../../components";
import "./Indec.css";
import { api } from "../../services/api";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function Indec() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    let active = true;

    api
      .indec(year)
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [year]);

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
            <select
              value={year}
              onChange={(event) => {
                setRecords([]);
                setError("");
                setLoading(true);
                setYear(event.target.value);
              }}
            >
              {[...new Set(["2024", "2025", "2026", String(new Date().getFullYear())])]
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
            <strong>{record.month ?? monthNames[record.mes - 1]}</strong>
            <b>{record.porcentaje ?? record.percentage}%</b>
          </div>
        ))}
        {loading && <p className="indec__empty">Cargando porcentajes...</p>}
        {!loading && error && <p className="indec__empty">{error}</p>}
        {!loading && !error && !records.length && (
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
