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

function currentIndecPeriod() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  return {
    year: Number(parts.find((part) => part.type === "year").value),
    month: Number(parts.find((part) => part.type === "month").value),
  };
}

export default function Indec() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const yearOptions = Array.from(
    { length: Math.max(1, currentYear + 2 - 2024) },
    (_, index) => String(2024 + index),
  );

  async function addPercentage({ year: selectedYear, month, percentage }) {
    const mes = monthNames.indexOf(month) + 1;
    const porcentaje = Number(percentage);

    if (mes < 1 || percentage === "" || !Number.isFinite(porcentaje) || porcentaje < 0) return;

    const periodoActual = currentIndecPeriod();
    const anio = Number(selectedYear);
    if (anio > periodoActual.year || (anio === periodoActual.year && mes > periodoActual.month)) {
      setError("No se puede cargar el porcentaje de un mes que todavía no empezó.");
      return;
    }

    setError("");
    setFeedback("");
    setLoading(true);

    try {
      await api.createIndec({ anio, mes, porcentaje });
      setYear(String(anio));
      setShowForm(false);
      setFeedback(`Porcentaje de ${month} ${anio} guardado.`);
      window.setTimeout(() => setFeedback(""), 2800);
      try {
        const updatedRecords = await api.indec(anio);
        setRecords(updatedRecords);
      } catch (refreshError) {
        setError(`Se guardó, pero no se pudo actualizar la lista: ${refreshError.message}`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
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
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
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
              {yearOptions.map((item) => (
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
        <IncreaseModal
          year={year}
          error={error}
          onClose={() => setShowForm(false)}
          onSubmit={addPercentage}
        />
      )}
    </main>
  );
}
