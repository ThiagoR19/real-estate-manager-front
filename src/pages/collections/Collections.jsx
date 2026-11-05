import { useEffect, useMemo, useState } from "react";
import { buildingColumnsIcon, calendarIcon, checkIcon, downloadIcon, fileLinesIcon, filterIcon, xIcon } from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import Button from "../../components/button/Button";
import "./Collections.css";
import "../payments/PaymentsMobile.css";

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
  const [feedback, setFeedback] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const detail = useMemo(() => collectionData[selectedMonth], [selectedMonth]);
  const hasReceipt = detail.status === "Cobrado";

  useEffect(() => {
    if (!timelineOpen && !summaryOpen && !receiptOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") { setTimelineOpen(false); setSummaryOpen(false); setReceiptOpen(false); }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [timelineOpen, summaryOpen, receiptOpen]);

  function toggleYear(year) {
    setOpenYears((current) => ({ ...current, [year]: !current[year] }));
  }

  function downloadReceipt() {
    setFeedback(`Comprobante de ${detail.title} listo para descargar.`);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  return (
    <main id="collections">
      <div className="payment-mobile__toolbar"><label><Icon src={buildingColumnsIcon} /><select aria-label="Propiedad" value={property} onChange={(event) => setProperty(event.target.value)}>{properties.map((name) => <option key={name}>{name}</option>)}</select></label><button type="button" aria-label="Abrir cronología" aria-expanded={timelineOpen} onClick={() => setTimelineOpen(true)}><Icon src={filterIcon} /></button></div>
      {timelineOpen && <button className="payment-mobile__close" type="button" aria-label="Cerrar cronología" onClick={() => setTimelineOpen(false)}>×</button>}
      <button className={`payment-mobile__summary-toggle${summaryOpen ? " is-open" : ""}`} type="button" aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de cobros"} aria-expanded={summaryOpen} onClick={() => setSummaryOpen(!summaryOpen)}>{summaryOpen ? "‹" : "›"}</button>
      <aside className={`collections__sidebar${timelineOpen ? " is-open" : ""}`} aria-label="Propiedades y períodos de cobro">
        <h1><span className="payment-mobile__desktop">Propiedades</span><span className="payment-mobile__chronology">Cronología</span></h1>
        <label className="collections__property-select">
          <span className="sr-only">Seleccionar propiedad</span>
          <button type="button" onClick={() => setProperty(properties[(properties.indexOf(property) + 1) % properties.length])} aria-label="Cambiar propiedad">
            <span aria-hidden="true">‹</span><strong>{property}</strong><span aria-hidden="true">›</span>
          </button>
        </label>
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
                  <button className={`collections__month${selectedMonth === period.month ? " is-selected" : ""}`} type="button" key={period.month} onClick={() => { setSelectedMonth(period.month); setTimelineOpen(false); }}>
                    <strong>{period.month}</strong><span className={`collections__status collections__status--${period.tone}`}>{period.status}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <section className="collections__workspace">
        <section className={`collections__summary${summaryOpen ? " is-open" : ""}`} aria-label="Resumen de cobros">
          <SummaryCard icon={fileLinesIcon} label="Total revisado este mes" value="550.000,10" tone="blue" />
          <SummaryCard icon={checkIcon} label="Pagos recibidos" value="5/9" tone="green" />
          <SummaryCard icon={xIcon} label="Meses impagos" value="5/9" tone="red" />
        </section>

        <div className="collections__content">
          <article className="collections__receipt-column">
            <button className="payment-mobile__open-receipt" type="button" onClick={() => setReceiptOpen(true)}><Icon src={fileLinesIcon} />{hasReceipt ? "Abrir comprobante" : "Ver comprobante"}</button>
            <div className={`collections__receipt-frame${hasReceipt ? "" : " is-empty"}${receiptOpen ? " is-open" : ""}`}>
              {receiptOpen && <button className="payment-mobile__close" type="button" aria-label="Cerrar comprobante" onClick={() => setReceiptOpen(false)}>×</button>}
              {hasReceipt ? <div className="collections__receipt" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA"><span className="collections__zoom">⌕</span></div> : <div className="collections__empty-receipt"><Icon src={fileLinesIcon} />Sin comprobante</div>}
            </div>
            <div className={`collections__receipt-status${hasReceipt ? " is-approved" : ""}`}><Icon src={fileLinesIcon} /><span><strong>{hasReceipt ? "Comprobante cargado" : "Sin comprobante cargado"}</strong><small>{hasReceipt ? `${detail.date} · 14:32 hs` : "Esperando comprobante del inquilino"}</small></span></div>
          </article>

          <article className="collections__detail">
            <header className="collections__detail-heading"><h2>{detail.title}</h2><span className={`collections__status collections__status--${hasReceipt ? "success" : detail.status === "Impago" ? "danger" : "info"}`}>{hasReceipt && <Icon src={checkIcon} />}{detail.status}</span></header>
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
            <aside className="collections__admin-note"><span><Icon src={fileLinesIcon} /></span><div><strong>Detalle de administración</strong><p>Se le informa la transferencia del dinero correspondiente al mes de {selectedMonth.toLowerCase()} 2023.</p></div></aside>
            <Button className="collections__download" icon={downloadIcon} text="Descargar comprobante" onClick={downloadReceipt} disabled={!hasReceipt} />
            <p className="collections__disclaimer">Nota: una vez liquidado el periodo, la información queda disponible para consultas y descarga</p>
            <p className="collections__feedback" aria-live="polite">{feedback}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
