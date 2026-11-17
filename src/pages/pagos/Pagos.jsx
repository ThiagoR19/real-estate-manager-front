import { useMemo, useState } from "react";
import {
  calendarIcon,
  checkIcon,
  downloadIcon,
  fileLinesIcon,
  magnifyingGlassIcon,
  paperPlaneIcon,
  xIcon,
} from "../../assets/icons";
import paymentReference from "../../assets/cobros.png";
import { Boton, mostrarAviso } from "../../components";
import "./Pagos.css";

const months = [
  { label: "Mayo", status: "Sin comprobante", tone: "neutral" },
  { label: "Marzo", status: "Impago", tone: "danger" },
  { label: "Abril", status: "Aprobado", tone: "success" },
  { label: "Febrero", status: "En proceso", tone: "info" },
  { label: "Enero", status: "Rechazado", tone: "danger" },
];

const detailsByMonth = {
  Mayo: {
    title: "Mayo 2023",
    status: "Sin comprobante",
    paid: "—",
    approved: "—",
    amount: "600.000,10",
    note: "Subí el comprobante de pago para que podamos revisarlo.",
    receiptDate: "Sin comprobante cargado",
  },
  Marzo: {
    title: "Marzo 2023",
    status: "Impago",
    paid: "—",
    approved: "—",
    amount: "600.000,10",
    note: "Todavía no registramos un pago para este período.",
    receiptDate: "Sin comprobante cargado",
  },
  Abril: {
    title: "Abril 2023",
    status: "Aprobado",
    paid: "06/04/2023",
    approved: "07/04/2023",
    amount: "600.000,10",
    commission: "-50.000",
    total: "650.000,10",
    note: "Cobro liquidado correctamente. La transferencia al propietario fue programada y el detalle de descuentos está incluido en la liquidación.",
    receiptDate: "06/04/2023 · 14:32 hs",
  },
  Febrero: {
    title: "Febrero 2023",
    status: "Aprobado",
    paid: "06/02/2023",
    approved: "07/02/2023",
    amount: "600.000,10",
    commission: "-50.000",
    total: "650.000,10",
    note: "Cobro liquidado correctamente. La transferencia al propietario fue programada y el detalle de descuentos está incluido en la liquidación.",
    receiptDate: "06/02/2023 · 14:32 hs",
  },
  Enero: {
    title: "Enero 2023",
    status: "Rechazado",
    paid: "06/01/2023",
    approved: "—",
    amount: "600.000,10",
    note: "El comprobante fue rechazado. Revisá los datos y volvé a enviarlo.",
    receiptDate: "06/01/2023 · 14:32 hs",
  },
};

function Icono({ src }) {
  return <img className="pagos__icon" src={src} alt="" aria-hidden="true" />;
}

function PildoraEstado({ status, tone }) {
  return <span className={`pagos__status pagos__status--${tone}`}>{status}</span>;
}

function BotonAnio({ year, expanded, onClick }) {
  return (
    <button
      className="pagos__year-button"
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
    >
      <strong>{year}</strong>
      <span className={`pagos__chevron${expanded ? " is-open" : ""}`} aria-hidden="true" />
    </button>
  );
}

export default function Pagos() {
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const details = useMemo(() => detailsByMonth[selectedMonth], [selectedMonth]);
  const hasReceipt = details.status !== "Sin comprobante" && details.status !== "Impago";
  const statusTone =
    details.status === "Aprobado"
      ? "approved"
      : details.status === "Rechazado"
        ? "rejected"
        : "info";

  function toggleYear(year) {
    setOpenYears((current) => ({ ...current, [year]: !current[year] }));
  }

  function selectMonth(month) {
    setSelectedMonth(month);
    setUploadedFile(null);
    setFeedback("");
  }

  function uploadReceipt(event) {
    const [file] = event.target.files ?? [];
    if (!file) return;
    setUploadedFile(file);
    setFeedback("Comprobante listo para enviar");
    mostrarAviso({ tipo: "info", titulo: "Comprobante seleccionado", mensaje: "El comprobante está listo para enviarse a revisión." });
    event.target.value = "";
  }

  return (
    <main id="pagos">
      <aside className="pagos__sidebar" aria-label="Propiedades y períodos">
        <h1>Propiedades</h1>
        <div className="pagos__propiedad-row">
          <label className="pagos__propiedad-switcher">
            <span className="sr-only">Seleccionar propiedad</span>
            <select defaultValue="Bielke 454">
              <option>Bielke 454</option>
              <option>Casa de San Isidro</option>
              <option>Belgrano 123</option>
            </select>
          </label>
          <button
            className="pagos__timeline-toggle"
            type="button"
            onClick={() => setTimelineOpen((open) => !open)}
            aria-expanded={timelineOpen}
            aria-label="Mostrar cronología"
          >
            <span aria-hidden="true">☷</span>
          </button>
        </div>
        <div className={`pagos__years${timelineOpen ? " is-open" : ""}`}>
          <section className="pagos__year">
            <BotonAnio
              year="2026"
              expanded={Boolean(openYears[2026])}
              onClick={() => toggleYear(2026)}
            />
            {openYears[2026] && <p className="pagos__year-empty">No hay períodos disponibles</p>}
          </section>
          <section className="pagos__year">
            <BotonAnio
              year="2025"
              expanded={Boolean(openYears[2025])}
              onClick={() => toggleYear(2025)}
            />
            {openYears[2025] && <p className="pagos__year-empty">No hay períodos disponibles</p>}
          </section>
          <section className="pagos__year">
            <BotonAnio
              year="2024"
              expanded={Boolean(openYears[2024])}
              onClick={() => toggleYear(2024)}
            />
            {openYears[2024] && (
              <div className="pagos__months">
                {months.map((month) => (
                  <button
                    key={month.label}
                    className={`pagos__month${selectedMonth === month.label ? " is-selected" : ""}`}
                    type="button"
                    onClick={() => selectMonth(month.label)}
                    aria-pressed={selectedMonth === month.label}
                  >
                    <strong>{month.label}</strong>
                    <PildoraEstado status={month.status} tone={month.tone} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <section className="pagos__workspace">
        <button
          className="pagos__summary-toggle"
          type="button"
          onClick={() => setSummaryOpen((open) => !open)}
          aria-expanded={summaryOpen}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <section
          className={`pagos__summary${summaryOpen ? " is-open" : ""}`}
          aria-label="Resumen de pagos"
        >
          <article className="pagos__summary-card pagos__summary-card--blue">
            <span className="pagos__metric-icon">
              <Icono src={fileLinesIcon} />
            </span>
            <strong>Comprobantes enviados</strong>
            <b>5/9</b>
          </article>
          <article className="pagos__summary-card pagos__summary-card--green">
            <span className="pagos__metric-icon">
              <Icono src={checkIcon} />
            </span>
            <strong>Pagos aprobados</strong>
            <b>5/9</b>
          </article>
          <article className="pagos__summary-card pagos__summary-card--red">
            <span className="pagos__metric-icon">
              <Icono src={xIcon} />
            </span>
            <strong>Pagos rechazados</strong>
            <b>5/9</b>
          </article>
        </section>

        <div className="pagos__content">
          <article className="pagos__receipt-column">
            <div className={`pagos__receipt-frame${hasReceipt ? "" : " is-empty"}`}>
              {hasReceipt ? (
                <div
                  className="pagos__receipt-reference"
                  style={{ "--payment-reference": `url(${paymentReference})` }}
                  role="img"
                  aria-label="Comprobante de transferencia BBVA"
                >
                  <button
                    className="pagos__receipt-zoom"
                    type="button"
                    aria-label="Ampliar comprobante"
                  >
                    <Icono src={magnifyingGlassIcon} />
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              ) : (
                <div className="pagos__empty-receipt">
                  <Icono src={fileLinesIcon} />
                  <span>Sin comprobante</span>
                </div>
              )}
            </div>
            <div className={`pagos__uploaded${hasReceipt ? " is-approved" : ""}`}>
              <Icono src={fileLinesIcon} />
              <span>
                <strong>
                  {uploadedFile
                    ? "Comprobante listo para enviar"
                    : hasReceipt
                      ? "Comprobante cargado"
                      : "Cargar comprobante"}
                </strong>
                <small>{uploadedFile ? uploadedFile.name : details.receiptDate}</small>
              </span>
            </div>
          </article>

          <section className="pagos__detail" aria-labelledby="payment-title">
            <div className="pagos__detail-heading">
              <h1 id="payment-title">{details.title}</h1>
              <span className={`pagos__status pagos__status--${statusTone}`}>
                {details.status === "Aprobado" && <Icono src={checkIcon} />}
                {details.status}
              </span>
            </div>
            <dl className="pagos__facts">
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de cobro:</dt>
                <dd>{details.paid}</dd>
              </div>
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de liquidación:</dt>
                <dd>{details.approved}</dd>
              </div>
              <div>
                <span className="pagos__coin-icon" aria-hidden="true">
                  $
                </span>
                <dt>Monto cobrado:</dt>
                <dd>{details.amount}</dd>
              </div>
              <div>
                <span className="pagos__percent-icon" aria-hidden="true">
                  %
                </span>
                <dt>Comisión inmobiliaria:</dt>
                <dd>{details.commission}</dd>
              </div>
              <div className="pagos__facts-total">
                <span className="pagos__coin-icon" aria-hidden="true">
                  $
                </span>
                <dt>Monto total:</dt>
                <dd>{details.total}</dd>
              </div>
            </dl>
            <aside
              className={`pagos__admin-note${details.status === "Rechazado" ? " is-rejected" : ""}`}
            >
              <span className="pagos__admin-note-icon">
                <Icono src={fileLinesIcon} />
              </span>
              <div>
                <strong>Detalle de administración</strong>
                <p>{details.note}</p>
              </div>
            </aside>
            <div className="pagos__actions">
              {hasReceipt ? (
                <button
                  className="pagos__button pagos__button--secondary"
                  type="button"
                  onClick={() => mostrarAviso({ tipo: "info", titulo: "Comprobante descargado", mensaje: `Se descargó el comprobante de ${details.title}.` })}
                >
                  <Icono src={downloadIcon} />
                  <span>Descargar comprobante</span>
                </button>
              ) : (
                <label className="pagos__button pagos__button--secondary">
                  <Icono src={downloadIcon} />
                  <span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span>
                  <input type="file" accept="image/*,.pdf" onChange={uploadReceipt} />
                </label>
              )}
              <Boton
                className="pagos__button pagos__button--primary"
                icon={paperPlaneIcon}
                text={
                  feedback === "Solicitud de revisión enviada"
                    ? "Enviado para revisión"
                    : "Solicitar revisión"
                }
                onClick={() => {
                  setFeedback("Solicitud de revisión enviada");
                  mostrarAviso({ tipo: "exito", titulo: "Solicitud enviada", mensaje: `Se envió a revisión el pago de ${details.title}.` });
                }}
              />
            </div>
            <p className="pagos__disclaimer">
              Nota: una vez liquidado el periodo, la información queda disponible para consultas y
              descarga
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
