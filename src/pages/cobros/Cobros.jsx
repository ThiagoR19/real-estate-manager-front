import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildingColumnsIcon,
  calendarIcon,
  checkIcon,
  downloadIcon,
  fileLinesIcon,
  magnifyingGlassIcon,
  optionsIcon,
  xIcon,
} from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import { Boton, mostrarAviso } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import "../pagos/PagosMovil.css";
import "./Cobros.css";

const properties = ["Bielke 454", "Casa de San Isidro", "Belgrano 123"];
const periods = [
  { month: "Mayo", status: "Sin comprobante", tone: "neutral" },
  { month: "Marzo", status: "Impago", tone: "danger" },
  { month: "Abril", status: "Cobrado", tone: "success" },
  { month: "Febrero", status: "En proceso", tone: "info" },
  { month: "Enero", status: "Impago", tone: "danger" },
];

const collectionData = {
  Mayo: {
    title: "Mayo 2023",
    status: "Sin comprobante",
    date: "—",
    settlement: "—",
    collected: "—",
    total: "—",
  },
  Marzo: {
    title: "Marzo 2023",
    status: "Impago",
    date: "—",
    settlement: "—",
    collected: "—",
    total: "—",
  },
  Abril: {
    title: "Abril 2023",
    status: "Cobrado",
    date: "06/04/2023",
    settlement: "07/04/2023",
    collected: "600.000,10",
    total: "550.000,10",
  },
  Febrero: {
    title: "Febrero 2023",
    status: "Cobrado",
    date: "06/02/2023",
    settlement: "07/02/2023",
    collected: "600.000,10",
    total: "550.000,10",
  },
  Enero: {
    title: "Enero 2023",
    status: "Impago",
    date: "—",
    settlement: "—",
    collected: "—",
    total: "—",
  },
};

function Icono({ src }) {
  return <img className="cobros__icon" src={src} alt="" aria-hidden="true" />;
}

function TarjetaResumen({ icon, label, value, tone }) {
  return (
    <article className={`cobros__summary-card cobros__summary-card--${tone}`}>
      <span className="cobros__summary-icon">
        <Icono src={icon} />
      </span>
      <strong>{label}</strong>
      <b>{value}</b>
    </article>
  );
}

export default function Cobros() {
  const [property, setProperty] = useState(properties[0]);
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const receiptDialog = useRef(null);
  const detail = useMemo(() => collectionData[selectedMonth], [selectedMonth]);
  const hasReceipt = detail.status === "Cobrado";

  useEffect(() => {
    if (!timelineOpen && !summaryOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setTimelineOpen(false);
        setSummaryOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [timelineOpen, summaryOpen]);

  function changeProperty(direction) {
    setProperty(
      (current) =>
        properties[
          (properties.indexOf(current) + direction + properties.length) % properties.length
        ],
    );
  }

  function chooseMonth(month) {
    setSelectedMonth(month);
    setTimelineOpen(false);
  }

  function toggleYear(year) {
    setOpenYears((current) => ({ ...current, [year]: !current[year] }));
  }

  function downloadReceipt() {
    mostrarAviso({ tipo: "info", titulo: "Comprobante listo", mensaje: `El comprobante de ${detail.title} está listo para descargar.` });
  }

  return (
    <main id="cobros">
      <div className="pago-movil__toolbar">
        <SelectDesplegable
          label="Propiedad"
          placeholder={property}
          value={property}
          options={properties}
          onChange={setProperty}
          icon={buildingColumnsIcon}
          className="cobros__mobile-propiedad-select"
          triggerClassName="cobros__mobile-propiedad-trigger"
          iconClassName="cobros__mobile-propiedad-icon"
          valueClassName="cobros__mobile-propiedad-value"
          chevronClassName="cobros__mobile-propiedad-chevron"
          blurOnSelect
        />
        <button
          type="button"
          aria-label="Abrir cronología"
          aria-controls="cobros-chronology"
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
        aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de cobros"}
        aria-controls="cobros-summary"
        aria-expanded={summaryOpen}
        onClick={() => {
          setSummaryOpen(!summaryOpen);
          setTimelineOpen(false);
        }}
      >
        {summaryOpen ? "‹" : "›"}
      </button>
      <aside
        className={`cobros__sidebar${timelineOpen ? " is-open" : ""}`}
        id="cobros-chronology"
        aria-label="Propiedades y períodos de cobro"
      >
        <h1>
          <span className="pago-movil__desktop">Propiedades</span>
          <span className="pago-movil__chronology">Cronología</span>
        </h1>
        <div className="cobros__propiedad-row">
          <button type="button" aria-label="Propiedad anterior" onClick={() => changeProperty(-1)}>
            ‹
          </button>
          <SelectDesplegable
            label="Seleccionar propiedad"
            placeholder={property}
            value={property}
            options={properties}
            onChange={setProperty}
            className="cobros__propiedad-select"
            triggerClassName="cobros__propiedad-trigger"
            valueClassName="cobros__propiedad-value"
            showChevron={false}
            blurOnSelect
          />
          <button type="button" aria-label="Propiedad siguiente" onClick={() => changeProperty(1)}>
            ›
          </button>
        </div>
        <div className="cobros__years">
          {["2026", "2025"].map((year) => (
            <section className="cobros__year" key={year}>
              <button
                className="cobros__year-toggle"
                type="button"
                onClick={() => toggleYear(year)}
                aria-expanded={Boolean(openYears[year])}
              >
                <strong>{year}</strong>
                <span className={`cobros__chevron${openYears[year] ? " is-open" : ""}`} />
              </button>
              {openYears[year] && <p>No hay períodos disponibles</p>}
            </section>
          ))}
          <section className="cobros__year">
            <button
              className="cobros__year-toggle"
              type="button"
              onClick={() => toggleYear("2024")}
              aria-expanded={Boolean(openYears[2024])}
            >
              <strong>2024</strong>
              <span className={`cobros__chevron${openYears[2024] ? " is-open" : ""}`} />
            </button>
            {openYears[2024] && (
              <div className="cobros__months">
                {periods.map((period) => (
                  <button
                    className={`cobros__month cobros__month--${period.tone}${selectedMonth === period.month ? " is-selected" : ""}`}
                    type="button"
                    key={period.month}
                    onClick={() => chooseMonth(period.month)}
                    aria-pressed={selectedMonth === period.month}
                  >
                    <strong>{period.month}</strong>
                    <span className={`cobros__status cobros__status--${period.tone}`}>
                      {period.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <section className="cobros__workspace">
        <section
          className={`cobros__summary${summaryOpen ? " is-open" : ""}`}
          id="cobros-summary"
          aria-label="Resumen de cobros"
        >
          <TarjetaResumen
            icon={fileLinesIcon}
            label="Total revisado este mes"
            value="550.000,10"
            tone="blue"
          />
          <TarjetaResumen icon={checkIcon} label="Pagos recibidos" value="5/9" tone="green" />
          <TarjetaResumen icon={xIcon} label="Meses impagos" value="5/9" tone="red" />
        </section>

        <div className="cobros__content">
          <article className="cobros__receipt-column">
            <button
              className="pago-movil__open-receipt"
              type="button"
              disabled={!hasReceipt}
              onClick={() => receiptDialog.current?.showModal()}
            >
              <Icono src={fileLinesIcon} />
              {hasReceipt ? "Abrir comprobante" : "Sin comprobante"}
            </button>
            <div className={`cobros__receipt-frame${hasReceipt ? "" : " is-empty"}`}>
              {hasReceipt ? (
                <>
                  <div
                    className="cobros__receipt"
                    style={{ "--payment-reference": `url(${paymentReference})` }}
                    role="img"
                    aria-label="Comprobante de transferencia BBVA"
                  />
                  <button
                    className="cobros__zoom"
                    type="button"
                    aria-label="Ampliar comprobante"
                    onClick={() => receiptDialog.current?.showModal()}
                  >
                    <Icono src={magnifyingGlassIcon} />
                    <span aria-hidden="true">+</span>
                  </button>
                </>
              ) : (
                <div className="cobros__empty-receipt">
                  <Icono src={fileLinesIcon} />
                  Sin comprobante
                </div>
              )}
            </div>
            <div className={`cobros__receipt-status${hasReceipt ? " is-approved" : ""}`}>
              <Icono src={fileLinesIcon} />
              <span>
                <strong>{hasReceipt ? "Comprobante cargado" : "Sin comprobante cargado"}</strong>
                <small>
                  {hasReceipt ? `${detail.date} · 14:32 hs` : "Esperando comprobante del inquilino"}
                </small>
              </span>
            </div>
          </article>

          <article className="cobros__detail" aria-labelledby="cobros-title">
            <header className="cobros__detail-heading">
              <h2 id="cobros-title">{detail.title}</h2>
              <span
                className={`cobros__status cobros__status--${hasReceipt ? "success" : detail.status === "Impago" ? "danger" : "neutral"}`}
              >
                {hasReceipt && <Icono src={checkIcon} />}
                {detail.status}
              </span>
            </header>
            <div className="cobros__financials">
              <div className="cobros__facts">
                <div>
                  <Icono src={calendarIcon} />
                  <strong>Fecha de cobro:</strong>
                  <b>{detail.date}</b>
                </div>
                <div>
                  <Icono src={calendarIcon} />
                  <strong>Fecha de liquidación:</strong>
                  <b>{detail.settlement}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto cobrado:</strong>
                  <b>{detail.collected}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">%</span>
                  <strong>Comisión inmobiliaria:</strong>
                  <b>-50.000</b>
                </div>
                <div className="cobros__facts-total">
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto total:</strong>
                  <b>{detail.total}</b>
                </div>
              </div>

              <section className="cobros__breakdown" aria-label="Detalle del cobro">
                <h3>Detalle del cobro</h3>
                {["Alquiler", "Gas", "Electricidad", "Agua", "Reparación"].map((item, index) => (
                  <div key={item}>
                    <span>{item}:</span>
                    <b>{index === 4 ? "-25.203,40" : "15.203,40"}</b>
                  </div>
                ))}
              </section>
            </div>
            <aside className="cobros__admin-note">
              <span>
                <Icono src={fileLinesIcon} />
              </span>
              <div>
                <strong>Detalle de administración</strong>
                <p>
                  Se le informa la transferencia del dinero correspondiente al mes de{" "}
                  {selectedMonth.toLowerCase()} 2023.
                </p>
              </div>
            </aside>
            <Boton
              className="cobros__download"
              onClick={downloadReceipt}
              disabled={!hasReceipt}
            >
              <Icono src={downloadIcon} />
              <span>Descargar comprobante</span>
            </Boton>
          </article>
        </div>
      </section>
      <dialog
        ref={receiptDialog}
        className="cobros__receipt-dialog"
        aria-label={`Comprobante de ${detail.title}`}
      >
        <button
          className="cobros__dialog-close"
          type="button"
          aria-label="Cerrar comprobante"
          onClick={() => receiptDialog.current?.close()}
        >
          ×
        </button>
        <div
          className="cobros__receipt"
          style={{ "--payment-reference": `url(${paymentReference})` }}
          role="img"
          aria-label="Comprobante de transferencia BBVA"
        />
      </dialog>
    </main>
  );
}
