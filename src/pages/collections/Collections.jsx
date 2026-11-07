import { useEffect, useMemo, useRef, useState } from "react";
import { buildingColumnsIcon, calendarIcon, checkIcon, downloadIcon, fileLinesIcon, filterIcon, magnifyingGlassIcon, xIcon } from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import { Button } from "../../components";
import "./Collections.css";

const properties = ["Bielke 454", "Casa de San Isidro", "Belgrano 123"];
const periods = [
  { month: "Mayo", status: "Sin comprobante", tone: "neutral" },
  { month: "Marzo", status: "Impago", tone: "danger" },
  { month: "Abril", status: "Cobrado", tone: "success" },
  { month: "Febrero", status: "En proceso", tone: "info" },
  { month: "Enero", status: "Impago", tone: "danger" },
];

const collectionData = {
  Mayo: { title: "Mayo 2023", status: "Sin comprobante", date: "—", settlement: "—", collected: "—", total: "—" },
  Marzo: { title: "Marzo 2023", status: "Impago", date: "—", settlement: "—", collected: "—", total: "—" },
  Abril: { title: "Abril 2023", status: "Cobrado", date: "06/04/2023", settlement: "07/04/2023", collected: "600.000,10", total: "550.000,10" },
  Febrero: { title: "Febrero 2023", status: "Cobrado", date: "06/02/2023", settlement: "07/02/2023", collected: "600.000,10", total: "550.000,10" },
  Enero: { title: "Enero 2023", status: "Impago", date: "—", settlement: "—", collected: "—", total: "—" },
};

function Icon({ src }) {
  return <img className="collections__icon" src={src} alt="" aria-hidden="true" />;
}

function SummaryCard({ icon, label, value, tone }) {
  return (
    <article className={`collections__summary-card collections__summary-card--${tone}`}>
      <span className="collections__summary-icon"><Icon src={icon} /></span>
      <strong>{label}</strong>
      <b>{value}</b>
    </article>
  );
}

export default function Collections() {
  const [property, setProperty] = useState(properties[0]);
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
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
    setProperty((current) => properties[(properties.indexOf(current) + direction + properties.length) % properties.length]);
    setFeedback("");
  }

  function chooseMonth(month) {
    setSelectedMonth(month);
    setTimelineOpen(false);
    setFeedback("");
  }

  function toggleYear(year) {
    setOpenYears((current) => ({ ...current, [year]: !current[year] }));
  }

  function downloadReceipt() {
    setFeedback(`Comprobante de ${detail.title} listo para descargar.`);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  return (
    <main id="collections">
      <div className="payment-mobile__toolbar">
        <label><Icon src={buildingColumnsIcon} /><select aria-label="Propiedad" value={property} onChange={(event) => setProperty(event.target.value)}>{properties.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" aria-label="Abrir cronología" aria-controls="collections-chronology" aria-expanded={timelineOpen} onClick={() => { setTimelineOpen(true); setSummaryOpen(false); }}><Icon src={filterIcon} /></button>
      </div>
      {timelineOpen && <button className="payment-mobile__close" type="button" aria-label="Cerrar cronología" onClick={() => setTimelineOpen(false)}>×</button>}
      <button className={`payment-mobile__summary-toggle${summaryOpen ? " is-open" : ""}`} type="button" aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de cobros"} aria-controls="collections-summary" aria-expanded={summaryOpen} onClick={() => { setSummaryOpen(!summaryOpen); setTimelineOpen(false); }}>{summaryOpen ? "‹" : "›"}</button>
      <aside className={`collections__sidebar${timelineOpen ? " is-open" : ""}`} id="collections-chronology" aria-label="Propiedades y períodos de cobro">
        <h1><span className="payment-mobile__desktop">Propiedades</span><span className="payment-mobile__chronology">Cronología</span></h1>
        <div className="collections__property-row">
          <button type="button" aria-label="Propiedad anterior" onClick={() => changeProperty(-1)}>‹</button>
          <label className="collections__property-select">
            <span className="sr-only">Seleccionar propiedad</span>
            <select value={property} onChange={(event) => setProperty(event.target.value)}>
              {properties.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" aria-label="Propiedad siguiente" onClick={() => changeProperty(1)}>›</button>
        </div>
        <div className="collections__years">
          {["2026", "2025"].map((year) => (
            <section className="collections__year" key={year}>
              <button className="collections__year-toggle" type="button" onClick={() => toggleYear(year)} aria-expanded={Boolean(openYears[year])}>
                <strong>{year}</strong><span className={`collections__chevron${openYears[year] ? " is-open" : ""}`} />
              </button>
              {openYears[year] && <p>No hay períodos disponibles</p>}
            </section>
          ))}
          <section className="collections__year">
            <button className="collections__year-toggle" type="button" onClick={() => toggleYear("2024")} aria-expanded={Boolean(openYears[2024])}>
              <strong>2024</strong><span className={`collections__chevron${openYears[2024] ? " is-open" : ""}`} />
            </button>
            {openYears[2024] && (
              <div className="collections__months">
                {periods.map((period) => (
                  <button className={`collections__month${selectedMonth === period.month ? " is-selected" : ""}`} type="button" key={period.month} onClick={() => chooseMonth(period.month)} aria-pressed={selectedMonth === period.month}>
                    <strong>{period.month}</strong><span className={`collections__status collections__status--${period.tone}`}>{period.status}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <section className="collections__workspace">
        <section className={`collections__summary${summaryOpen ? " is-open" : ""}`} id="collections-summary" aria-label="Resumen de cobros">
          <SummaryCard icon={fileLinesIcon} label="Total revisado este mes" value="550.000,10" tone="blue" />
          <SummaryCard icon={checkIcon} label="Pagos recibidos" value="5/9" tone="green" />
          <SummaryCard icon={xIcon} label="Meses impagos" value="5/9" tone="red" />
        </section>

        <div className="collections__content">
          <article className="collections__receipt-column">
            <button className="payment-mobile__open-receipt" type="button" disabled={!hasReceipt} onClick={() => receiptDialog.current?.showModal()}><Icon src={fileLinesIcon} />{hasReceipt ? "Abrir comprobante" : "Sin comprobante"}</button>
            <div className={`collections__receipt-frame${hasReceipt ? "" : " is-empty"}`}>
              {hasReceipt ? <><div className="collections__receipt" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA" /><button className="collections__zoom" type="button" aria-label="Ampliar comprobante" onClick={() => receiptDialog.current?.showModal()}><Icon src={magnifyingGlassIcon} /><span aria-hidden="true">+</span></button></> : <div className="collections__empty-receipt"><Icon src={fileLinesIcon} />Sin comprobante</div>}
            </div>
            <div className={`collections__receipt-status${hasReceipt ? " is-approved" : ""}`}><Icon src={fileLinesIcon} /><span><strong>{hasReceipt ? "Comprobante cargado" : "Sin comprobante cargado"}</strong><small>{hasReceipt ? `${detail.date} · 14:32 hs` : "Esperando comprobante del inquilino"}</small></span></div>
          </article>

          <article className="collections__detail" aria-labelledby="collections-title">
            <header className="collections__detail-heading"><h2 id="collections-title">{detail.title}</h2><span className={`collections__status collections__status--${hasReceipt ? "success" : detail.status === "Impago" ? "danger" : "neutral"}`}>{hasReceipt && <Icon src={checkIcon} />}{detail.status}</span></header>
            <div className="collections__financials">
              <div className="collections__facts">
                <div><Icon src={calendarIcon} /><strong>Fecha de cobro:</strong><b>{detail.date}</b></div>
                <div><Icon src={calendarIcon} /><strong>Fecha de liquidación:</strong><b>{detail.settlement}</b></div>
                <div><span className="collections__round-symbol">$</span><strong>Monto cobrado:</strong><b>{detail.collected}</b></div>
                <div><span className="collections__round-symbol">%</span><strong>Comisión inmobiliaria:</strong><b>-50.000</b></div>
                <div className="collections__facts-total"><span className="collections__round-symbol">$</span><strong>Monto total:</strong><b>{detail.total}</b></div>
              </div>

              <section className="collections__breakdown" aria-label="Detalle del cobro">
                <h3>Detalle del cobro</h3>
                {["Alquiler", "Gas", "Electricidad", "Agua", "Reparación"].map((item, index) => <div key={item}><span>{item}:</span><b>{index === 4 ? "-25.203,40" : "15.203,40"}</b></div>)}
              </section>
            </div>
            <aside className="collections__admin-note"><span><Icon src={fileLinesIcon} /></span><div><strong>Detalle de administración</strong><p>Se le informa la transferencia del dinero correspondiente al mes de {selectedMonth.toLowerCase()} 2023.</p></div></aside>
            <Button className="collections__download" onClick={downloadReceipt} disabled={!hasReceipt}><Icon src={downloadIcon} /><span>Descargar comprobante</span></Button>
            <p className="collections__feedback" aria-live="polite">{feedback}</p>
          </article>
        </div>
      </section>
      <dialog ref={receiptDialog} className="collections__receipt-dialog" aria-label={`Comprobante de ${detail.title}`}>
        <button className="collections__dialog-close" type="button" aria-label="Cerrar comprobante" onClick={() => receiptDialog.current?.close()}>×</button>
        <div className="collections__receipt" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA" />
      </dialog>
    </main>
  );
}
