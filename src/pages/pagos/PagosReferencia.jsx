import { useEffect, useMemo, useState } from "react";
import {
  buildingColumnsIcon,
  calendarIcon,
  checkIcon,
  downloadIcon,
  fileLinesIcon,
  magnifyingGlassIcon,
  optionsIcon,
  paperPlaneIcon,
  xIcon,
} from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import { Boton } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import "./PagosReferencia.css";
import "./PagosMovil.css";

const months = [
  ["Mayo", "Sin comprobante", "neutral"],
  ["Marzo", "Impago", "danger"],
  ["Abril", "Aprobado", "success"],
  ["Febrero", "En proceso", "info"],
  ["Enero", "Rechazado", "danger"],
];
const properties = ["Bielke 454", "Casa de San Isidro", "Belgrano 123"];
const details = {
  Mayo: [
    "Mayo 2023",
    "Sin comprobante",
    "—",
    "—",
    "600.000,10",
    "Subí el comprobante de pago para que podamos revisarlo.",
    "Sin comprobante cargado",
  ],
  Marzo: [
    "Marzo 2023",
    "Impago",
    "—",
    "—",
    "600.000,10",
    "Todavía no registramos un pago para este período.",
    "Sin comprobante cargado",
  ],
  Abril: [
    "Abril 2023",
    "Aprobado",
    "06/04/2023",
    "07/04/2023",
    "600.000,10",
    "Pago aprobado correctamente. No se requieren acciones adicionales",
    "06/04/2023 · 14:32 hs",
  ],
  Febrero: [
    "Febrero 2023",
    "Aprobado",
    "06/02/2023",
    "07/02/2023",
    "600.000,10",
    "Pago aprobado correctamente. No se requieren acciones adicionales",
    "06/02/2023 · 14:32 hs",
  ],
  Enero: [
    "Enero 2023",
    "Rechazado",
    "06/01/2023",
    "—",
    "600.000,10",
    "El comprobante fue rechazado. Revisá los datos y volvé a enviarlo.",
    "06/01/2023 · 14:32 hs",
  ],
};

function Icono({ src }) {
  return <img className="vista-pago__icon" src={src} alt="" aria-hidden="true" />;
}

export default function PagosReferencia() {
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [property, setProperty] = useState(properties[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [title, status, paid, approved, amount, note, receiptDate] = useMemo(
    () => details[selectedMonth],
    [selectedMonth],
  );
  const hasReceipt = status !== "Sin comprobante" && status !== "Impago";
  const tone = status === "Aprobado" ? "approved" : status === "Rechazado" ? "rejected" : "info";

  function toggleYear(year) {
    setOpenYears((current) => ({ ...current, [year]: !current[year] }));
  }
  function changeProperty(direction) {
    setProperty(
      (current) =>
        properties[
          (properties.indexOf(current) + direction + properties.length) % properties.length
        ],
    );
  }
  useEffect(() => {
    if (!timelineOpen && !summaryOpen && !receiptOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setTimelineOpen(false);
        setSummaryOpen(false);
        setReceiptOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [timelineOpen, summaryOpen, receiptOpen]);

  function chooseMonth(month) {
    setSelectedMonth(month);
    setUploadedFile(null);
    setFeedback("");
    setTimelineOpen(false);
  }
  function upload(event) {
    const [file] = event.target.files ?? [];
    if (!file) return;
    setUploadedFile(file);
    setFeedback("Comprobante listo para enviar");
    event.target.value = "";
  }

  return (
    <main id="vista-pago">
      <div className="pago-movil__toolbar">
        <SelectDesplegable
          label="Propiedad"
          placeholder={property}
          value={property}
          options={properties}
          onChange={setProperty}
          icon={buildingColumnsIcon}
          className="vista-pago__mobile-propiedad-select"
          triggerClassName="vista-pago__mobile-propiedad-trigger"
          iconClassName="vista-pago__mobile-propiedad-icon"
          valueClassName="vista-pago__mobile-propiedad-value"
          chevronClassName="vista-pago__mobile-propiedad-chevron"
          blurOnSelect
        />
        <button
          type="button"
          aria-label="Abrir cronología"
          aria-controls="vista-pago-chronology"
          aria-expanded={timelineOpen}
          onClick={() => {
            setTimelineOpen(true);
            setSummaryOpen(false);
          }}
        >
          <Icono src={optionsIcon} />
        </button>
      </div>
      {timelineOpen && (
        <button
          className="pago-movil__close"
          type="button"
          aria-label="Cerrar cronología"
          onClick={() => setTimelineOpen(false)}
        >
          ×
        </button>
      )}
      <button
        className={`pago-movil__summary-toggle${summaryOpen ? " is-open" : ""}`}
        type="button"
        aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de pagos"}
        aria-controls="vista-pago-summary"
        aria-expanded={summaryOpen}
        onClick={() => {
          setSummaryOpen(!summaryOpen);
          setTimelineOpen(false);
        }}
      >
        {summaryOpen ? "‹" : "›"}
      </button>
      <aside
        className={`vista-pago__sidebar pagos__sidebar${timelineOpen ? " is-open" : ""}`}
        id="vista-pago-chronology"
        aria-label="Propiedades y períodos"
      >
        <h1>
          <span className="pago-movil__desktop">Propiedades</span>
          <span className="pago-movil__chronology">Cronología</span>
        </h1>
        <div className="vista-pago__propiedad-row">
          <button type="button" aria-label="Propiedad anterior" onClick={() => changeProperty(-1)}>
            ‹
          </button>
          <SelectDesplegable
            label="Seleccionar propiedad"
            placeholder={property}
            value={property}
            options={properties}
            onChange={setProperty}
            className="vista-pago__propiedad-select"
            triggerClassName="vista-pago__propiedad-trigger"
            valueClassName="vista-pago__propiedad-value"
            blurOnSelect
            showChevron={false}
          />
          <button type="button" aria-label="Propiedad siguiente" onClick={() => changeProperty(1)}>
            ›
          </button>
        </div>
        <div className="vista-pago__years pagos__years">
          {["2026", "2025"].map((year) => (
            <section className="vista-pago__year pagos__year" key={year}>
              <button
                className="vista-pago__year-button"
                type="button"
                onClick={() => toggleYear(year)}
                aria-expanded={Boolean(openYears[year])}
              >
                <strong>{year}</strong>
                <span className={`vista-pago__chevron${openYears[year] ? " is-open" : ""}`} />
              </button>
              {openYears[year] && <p>No hay períodos disponibles</p>}
            </section>
          ))}
          <section className="vista-pago__year pagos__year">
            <button
              className="vista-pago__year-button"
              type="button"
              onClick={() => toggleYear("2024")}
              aria-expanded={Boolean(openYears[2024])}
            >
              <strong>2024</strong>
              <span className={`vista-pago__chevron${openYears[2024] ? " is-open" : ""}`} />
            </button>
            {openYears[2024] && (
              <div className="vista-pago__months">
                {months.map(([month, monthStatus, monthTone]) => (
                  <button
                    key={month}
                    className={`vista-pago__month vista-pago__month--${monthTone} pagos__month${month === selectedMonth ? " is-selected" : ""}`}
                    type="button"
                    onClick={() => chooseMonth(month)}
                    aria-pressed={month === selectedMonth}
                  >
                    <strong>{month}</strong>
                    <span className={`vista-pago__status vista-pago__status--${monthTone}`}>
                      {monthStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
      <section className="vista-pago__workspace pagos__workspace">
        <section
          className={`vista-pago__summary pagos__summary${summaryOpen ? " is-open" : ""}`}
          id="vista-pago-summary"
          aria-label="Resumen de pagos"
        >
          <article>
            <span className="vista-pago__metric vista-pago__metric--blue">
              <Icono src={fileLinesIcon} />
            </span>
            <strong>Comprobantes enviados</strong>
            <b>5/9</b>
          </article>
          <article>
            <span className="vista-pago__metric vista-pago__metric--green">
              <Icono src={checkIcon} />
            </span>
            <strong>Pagos aprobados</strong>
            <b>5/9</b>
          </article>
          <article>
            <span className="vista-pago__metric vista-pago__metric--red">
              <Icono src={xIcon} />
            </span>
            <strong>Pagos rechazados</strong>
            <b>5/9</b>
          </article>
        </section>
        <div className="vista-pago__content pagos__content">
          <article className="vista-pago__receipt-column pagos__receipt-column">
            <button
              className="pago-movil__open-receipt"
              type="button"
              onClick={() => setReceiptOpen(true)}
            >
              <Icono src={fileLinesIcon} />
              {hasReceipt ? "Abrir comprobante" : "Ver comprobante"}
            </button>
            <div
              className={`vista-pago__receipt-frame pagos__receipt-frame${hasReceipt ? "" : " is-empty"}${receiptOpen ? " is-open" : ""}`}
            >
              {receiptOpen && (
                <button
                  className="pago-movil__close"
                  type="button"
                  aria-label="Cerrar comprobante"
                  onClick={() => setReceiptOpen(false)}
                >
                  ×
                </button>
              )}
              {hasReceipt ? (
                <div
                  className="vista-pago__receipt"
                  style={{ "--payment-reference": `url(${paymentReference})` }}
                  role="img"
                  aria-label="Comprobante de transferencia BBVA"
                >
                  <button type="button" aria-label="Ampliar comprobante">
                    <Icono src={magnifyingGlassIcon} />
                    <span>+</span>
                  </button>
                </div>
              ) : (
                <div className="vista-pago__empty-receipt">
                  <Icono src={fileLinesIcon} />
                  Sin comprobante
                </div>
              )}
            </div>
            <div
              className={`vista-pago__uploaded pagos__uploaded${hasReceipt ? " is-approved" : ""}`}
            >
              <Icono src={fileLinesIcon} />
              <span>
                <strong>
                  {uploadedFile
                    ? "Comprobante listo para enviar"
                    : hasReceipt
                      ? "Comprobante cargado"
                      : "Cargar comprobante"}
                </strong>
                <small>{uploadedFile ? uploadedFile.name : receiptDate}</small>
              </span>
            </div>
          </article>
          <section
            className="vista-pago__detail pagos__detail"
            aria-labelledby="vista-pago-title"
          >
            <header className="pagos__detail-heading">
              <h1 id="vista-pago-title">{title}</h1>
              <span
                className={`vista-pago__status pagos__status vista-pago__status--${tone}`}
              >
                {status === "Aprobado" && <Icono src={checkIcon} />}
                {status}
              </span>
            </header>
            <dl className="pagos__facts">
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de pago:</dt>
                <dd>{paid}</dd>
              </div>
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de aprobación:</dt>
                <dd>{approved}</dd>
              </div>
              <div>
                <span className="vista-pago__coin">$</span>
                <dt>Monto abonado:</dt>
                <dd>{amount}</dd>
              </div>
              <div className="vista-pago__mobile-only pagos__facts-total">
                <span className="vista-pago__coin">$</span>
                <dt>Monto total:</dt>
                <dd>{amount}</dd>
              </div>
            </dl>
            <section
              className="vista-pago__mobile-only pagos__breakdown"
              aria-label="Detalle del pago"
            >
              <h3>Detalle del pago</h3>
              <div>
                <span>Pago del período:</span>
                <b>{amount}</b>
              </div>
              <p className="vista-pago__breakdown-note">
                No hay un desglose por concepto disponible para este período.
              </p>
            </section>
            <aside className="pagos__admin-note">
              <span>
                <Icono src={fileLinesIcon} />
              </span>
              <div>
                <strong>Observaciones de administración</strong>
                <p>{note}</p>
              </div>
            </aside>
            <div className="vista-pago__actions pagos__actions">
              <label className="pagos__button">
                <Icono src={downloadIcon} />
                <span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span>
                <input type="file" accept="image/*,.pdf" onChange={upload} />
              </label>
              <Boton
                className="pagos__button"
                icon={paperPlaneIcon}
                text={feedback ? "Enviado para revisión" : "Enviar para revisión"}
                onClick={() => setFeedback("Solicitud de revisión enviada")}
              />
            </div>
            <p className="vista-pago__note pagos__disclaimer">
              Nota: Cuando un comprobante es aprobado, ya no puede modificarse.
            </p>
            <p className="vista-pago__feedback pagos__feedback" aria-live="polite">
              {feedback}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
