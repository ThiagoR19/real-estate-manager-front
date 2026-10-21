import { useMemo, useState } from "react";
import { calendarIcon, checkIcon, downloadIcon, fileLinesIcon, magnifyingGlassIcon, paperPlaneIcon, xIcon } from "../../assets/icons";
import paymentReference from "../../assets/pagos.png";
import "./PaymentsReference.css";

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
  const [title, status, paid, approved, amount, note, receiptDate] = useMemo(() => details[selectedMonth], [selectedMonth]);
  const hasReceipt = status !== "Sin comprobante" && status !== "Impago";
  const tone = status === "Aprobado" ? "approved" : status === "Rechazado" ? "rejected" : "info";

  function toggleYear(year) { setOpenYears((current) => ({ ...current, [year]: !current[year] })); }
  function chooseMonth(month) { setSelectedMonth(month); setUploadedFile(null); setFeedback(""); }
  function upload(event) { const [file] = event.target.files ?? []; if (!file) return; setUploadedFile(file); setFeedback("Comprobante listo para enviar"); event.target.value = ""; }

  return (
    <main id="payment-view">
      <aside className="payment-view__sidebar" aria-label="Propiedades y períodos">
        <h1>Propiedades</h1>
        <button className="payment-view__property" type="button" aria-label="Cambiar propiedad"><span>‹</span><strong>Bielke 454</strong><span>›</span></button>
        <div className="payment-view__years">
          {["2026", "2025"].map((year) => <section className="payment-view__year" key={year}>
            <button className="payment-view__year-button" type="button" onClick={() => toggleYear(year)} aria-expanded={Boolean(openYears[year])}><strong>{year}</strong><span className={`payment-view__chevron${openYears[year] ? " is-open" : ""}`} /></button>
            {openYears[year] && <p>No hay períodos disponibles</p>}
          </section>)}
          <section className="payment-view__year">
            <button className="payment-view__year-button" type="button" onClick={() => toggleYear("2024")} aria-expanded={Boolean(openYears[2024])}><strong>2024</strong><span className={`payment-view__chevron${openYears[2024] ? " is-open" : ""}`} /></button>
            {openYears[2024] && <div className="payment-view__months">{months.map(([month, monthStatus, monthTone]) => <button key={month} className={`payment-view__month${month === selectedMonth ? " is-selected" : ""}`} type="button" onClick={() => chooseMonth(month)} aria-pressed={month === selectedMonth}><strong>{month}</strong><span className={`payment-view__status payment-view__status--${monthTone}`}>{monthStatus}</span></button>)}</div>}
          </section>
        </div>
      </aside>
      <section className="payment-view__workspace">
        <section className="payment-view__summary" aria-label="Resumen de pagos">
          <article><span className="payment-view__metric payment-view__metric--blue"><Icon src={fileLinesIcon} /></span><strong>Comprobantes enviados</strong><b>5/9</b></article>
          <article><span className="payment-view__metric payment-view__metric--green"><Icon src={checkIcon} /></span><strong>Pagos aprobados</strong><b>5/9</b></article>
          <article><span className="payment-view__metric payment-view__metric--red"><Icon src={xIcon} /></span><strong>Pagos rechazados</strong><b>5/9</b></article>
        </section>
        <div className="payment-view__content">
          <article className="payment-view__receipt-column">
            <div className={`payment-view__receipt-frame${hasReceipt ? "" : " is-empty"}`}>
              {hasReceipt ? <div className="payment-view__receipt" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA"><button type="button" aria-label="Ampliar comprobante"><Icon src={magnifyingGlassIcon} /><span>+</span></button></div> : <div className="payment-view__empty-receipt"><Icon src={fileLinesIcon} />Sin comprobante</div>}
            </div>
            <div className={`payment-view__uploaded${hasReceipt ? " is-approved" : ""}`}><Icon src={fileLinesIcon} /><span><strong>{uploadedFile ? "Comprobante listo para enviar" : hasReceipt ? "Comprobante cargado" : "Cargar comprobante"}</strong><small>{uploadedFile ? uploadedFile.name : receiptDate}</small></span></div>
          </article>
          <section className="payment-view__detail" aria-labelledby="payment-view-title">
            <header><h1 id="payment-view-title">{title}</h1><span className={`payment-view__status payment-view__status--${tone}`}>{status === "Aprobado" && <Icon src={checkIcon} />}{status}</span></header>
            <dl><div><Icon src={calendarIcon} /><dt>Fecha de pago:</dt><dd>{paid}</dd></div><div><Icon src={calendarIcon} /><dt>Fecha de aprobación:</dt><dd>{approved}</dd></div><div><span className="payment-view__coin">$</span><dt>Monto abonado:</dt><dd>{amount}</dd></div></dl>
            <aside className={status === "Rechazado" ? "is-rejected" : ""}><span><Icon src={fileLinesIcon} /></span><div><strong>Observaciones de administración</strong><p>{note}</p></div></aside>
            <div className="payment-view__actions"><label><Icon src={downloadIcon} /><span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span><input type="file" accept="image/*,.pdf" onChange={upload} /></label><button type="button" onClick={() => setFeedback("Solicitud de revisión enviada")}><Icon src={paperPlaneIcon} /><span>{feedback ? "Enviado para revisión" : "Enviar para revisión"}</span></button></div>
            <p className="payment-view__note">Nota: Cuando un comprobante es aprobado, ya no puede modificarse.</p><p className="payment-view__feedback" aria-live="polite">{feedback}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
