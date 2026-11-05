import { useEffect, useMemo, useState } from "react";
import { buildingColumnsIcon, calendarIcon, checkIcon, downloadIcon, fileLinesIcon, filterIcon, magnifyingGlassIcon, paperPlaneIcon, xIcon } from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import { Button } from "../../components";
import "./PaymentsReference.css";
import "./PaymentsMobile.css";

const months = [["Mayo", "Sin comprobante", "neutral"], ["Marzo", "Impago", "danger"], ["Abril", "Aprobado", "success"], ["Febrero", "En proceso", "info"], ["Enero", "Rechazado", "danger"]];
const details = {
  Mayo: ["Mayo 2023", "Sin comprobante", "—", "—", "600.000,10", "Subí el comprobante de pago para que podamos revisarlo.", "Sin comprobante cargado"],
  Marzo: ["Marzo 2023", "Impago", "—", "—", "600.000,10", "Todavía no registramos un pago para este período.", "Sin comprobante cargado"],
  Abril: ["Abril 2023", "Aprobado", "06/04/2023", "07/04/2023", "600.000,10", "Pago aprobado correctamente. No se requieren acciones adicionales", "06/04/2023 · 14:32 hs"],
  Febrero: ["Febrero 2023", "Aprobado", "06/02/2023", "07/02/2023", "600.000,10", "Pago aprobado correctamente. No se requieren acciones adicionales", "06/02/2023 · 14:32 hs"],
  Enero: ["Enero 2023", "Rechazado", "06/01/2023", "—", "600.000,10", "El comprobante fue rechazado. Revisá los datos y volvé a enviarlo.", "06/01/2023 · 14:32 hs"],
};

function Icon({ src }) { return <img className="payment-view__icon" src={src} alt="" aria-hidden="true" />; }

export default function PaymentsReference() {
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [title, status, paid, approved, amount, note, receiptDate] = useMemo(() => details[selectedMonth], [selectedMonth]);
  const hasReceipt = status !== "Sin comprobante" && status !== "Impago";
  const tone = status === "Aprobado" ? "approved" : status === "Rechazado" ? "rejected" : "info";

  function toggleYear(year) { setOpenYears((current) => ({ ...current, [year]: !current[year] })); }
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

  function chooseMonth(month) { setSelectedMonth(month); setUploadedFile(null); setFeedback(""); setTimelineOpen(false); }
  function upload(event) { const [file] = event.target.files ?? []; if (!file) return; setUploadedFile(file); setFeedback("Comprobante listo para enviar"); event.target.value = ""; }

  return (
    <main id="payment-view">
      <div className="payment-mobile__toolbar">
        <label><Icon src={buildingColumnsIcon} /><select aria-label="Propiedad"><option>Bielke 454</option></select></label>
        <button type="button" aria-label="Abrir cronología" aria-controls="payment-view-chronology" aria-expanded={timelineOpen} onClick={() => { setTimelineOpen(true); setSummaryOpen(false); }}><Icon src={filterIcon} /></button>
      </div>
      {timelineOpen && <button className="payment-mobile__close" type="button" aria-label="Cerrar cronología" onClick={() => setTimelineOpen(false)}>×</button>}
      <button className={`payment-mobile__summary-toggle${summaryOpen ? " is-open" : ""}`} type="button" aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de pagos"} aria-controls="payment-view-summary" aria-expanded={summaryOpen} onClick={() => { setSummaryOpen(!summaryOpen); setTimelineOpen(false); }}>{summaryOpen ? "‹" : "›"}</button>
      <aside className={`payment-view__sidebar payments__sidebar${timelineOpen ? " is-open" : ""}`} id="payment-view-chronology" aria-label="Propiedades y períodos">
        <h1><span className="payment-mobile__desktop">Propiedades</span><span className="payment-mobile__chronology">Cronología</span></h1>
        <Button className="payment-view__property payments__property-switcher" aria-label="Cambiar propiedad"><span aria-hidden="true">‹</span><strong>Bielke 454</strong><span aria-hidden="true">›</span></Button>
        <div className="payment-view__years payments__years">
          {["2026", "2025"].map((year) => <section className="payment-view__year payments__year" key={year}>
            <button className="payment-view__year-button" type="button" onClick={() => toggleYear(year)} aria-expanded={Boolean(openYears[year])}><strong>{year}</strong><span className={`payment-view__chevron${openYears[year] ? " is-open" : ""}`} /></button>
            {openYears[year] && <p>No hay períodos disponibles</p>}
          </section>)}
          <section className="payment-view__year payments__year">
            <button className="payment-view__year-button" type="button" onClick={() => toggleYear("2024")} aria-expanded={Boolean(openYears[2024])}><strong>2024</strong><span className={`payment-view__chevron${openYears[2024] ? " is-open" : ""}`} /></button>
            {openYears[2024] && <div className="payment-view__months">{months.map(([month, monthStatus, monthTone]) => <button key={month} className={`payment-view__month payments__month${month === selectedMonth ? " is-selected" : ""}`} type="button" onClick={() => chooseMonth(month)} aria-pressed={month === selectedMonth}><strong>{month}</strong><span className={`payment-view__status payment-view__status--${monthTone}`}>{monthStatus}</span></button>)}</div>}
          </section>
        </div>
      </aside>
      <section className="payment-view__workspace payments__workspace">
        <section className={`payment-view__summary payments__summary${summaryOpen ? " is-open" : ""}`} id="payment-view-summary" aria-label="Resumen de pagos">
          <article><span className="payment-view__metric payment-view__metric--blue"><Icon src={fileLinesIcon} /></span><strong>Comprobantes enviados</strong><b>5/9</b></article>
          <article><span className="payment-view__metric payment-view__metric--green"><Icon src={checkIcon} /></span><strong>Pagos aprobados</strong><b>5/9</b></article>
          <article><span className="payment-view__metric payment-view__metric--red"><Icon src={xIcon} /></span><strong>Pagos rechazados</strong><b>5/9</b></article>
        </section>
        <div className="payment-view__content payments__content">
          <article className="payment-view__receipt-column payments__receipt-column">
            <button className="payment-mobile__open-receipt" type="button" onClick={() => setReceiptOpen(true)}><Icon src={fileLinesIcon} />{hasReceipt ? "Abrir comprobante" : "Ver comprobante"}</button>
            <div className={`payment-view__receipt-frame payments__receipt-frame${hasReceipt ? "" : " is-empty"}${receiptOpen ? " is-open" : ""}`}>
              {receiptOpen && <button className="payment-mobile__close" type="button" aria-label="Cerrar comprobante" onClick={() => setReceiptOpen(false)}>×</button>}
              {hasReceipt ? <div className="payment-view__receipt" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA"><button type="button" aria-label="Ampliar comprobante"><Icon src={magnifyingGlassIcon} /><span>+</span></button></div> : <div className="payment-view__empty-receipt"><Icon src={fileLinesIcon} />Sin comprobante</div>}
            </div>
            <div className={`payment-view__uploaded payments__uploaded${hasReceipt ? " is-approved" : ""}`}><Icon src={fileLinesIcon} /><span><strong>{uploadedFile ? "Comprobante listo para enviar" : hasReceipt ? "Comprobante cargado" : "Cargar comprobante"}</strong><small>{uploadedFile ? uploadedFile.name : receiptDate}</small></span></div>
          </article>
          <section className="payment-view__detail payments__detail" aria-labelledby="payment-view-title">
            <header className="payments__detail-heading"><h1 id="payment-view-title">{title}</h1><span className={`payment-view__status payments__status payment-view__status--${tone}`}>{status === "Aprobado" && <Icon src={checkIcon} />}{status}</span></header>
            <dl className="payments__facts"><div><Icon src={calendarIcon} /><dt>Fecha de pago:</dt><dd>{paid}</dd></div><div><Icon src={calendarIcon} /><dt>Fecha de aprobación:</dt><dd>{approved}</dd></div><div><span className="payment-view__coin">$</span><dt>Monto abonado:</dt><dd>{amount}</dd></div><div className="payment-view__mobile-only payments__facts-total"><span className="payment-view__coin">$</span><dt>Monto total:</dt><dd>{amount}</dd></div></dl>
            <section className="payment-view__mobile-only payments__breakdown" aria-label="Detalle del pago"><h3>Detalle del pago</h3><div><span>Pago del período:</span><b>{amount}</b></div><p className="payment-view__breakdown-note">No hay un desglose por concepto disponible para este período.</p></section>
            <aside className={`payments__admin-note${status === "Rechazado" ? " is-rejected" : ""}`}><span><Icon src={fileLinesIcon} /></span><div><strong>Observaciones de administración</strong><p>{note}</p></div></aside>
            <div className="payment-view__actions payments__actions"><label className="payments__button"><Icon src={downloadIcon} /><span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span><input type="file" accept="image/*,.pdf" onChange={upload} /></label><Button className="payments__button" icon={paperPlaneIcon} text={feedback ? "Enviado para revisión" : "Enviar para revisión"} onClick={() => setFeedback("Solicitud de revisión enviada")} /></div>
            <p className="payment-view__note payments__disclaimer">Nota: Cuando un comprobante es aprobado, ya no puede modificarse.</p><p className="payment-view__feedback payments__feedback" aria-live="polite">{feedback}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
