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
import { Button } from '../../components';
import "./Payments.css";

const months = [
  { label: "Mayo", status: "Sin comprobante", tone: "neutral" },
  { label: "Marzo", status: "Impago", tone: "danger" },
  { label: "Abril", status: "Aprobado", tone: "success" },
  { label: "Febrero", status: "En proceso", tone: "info" },
  { label: "Enero", status: "Rechazado", tone: "danger" },
];

const detailsByMonth = {
  Mayo: { title: "Mayo 2023", status: "Sin comprobante", paid: "—", approved: "—", amount: "600.000,10", note: "Subí el comprobante de pago para que podamos revisarlo.", receiptDate: "Sin comprobante cargado" },
  Marzo: { title: "Marzo 2023", status: "Impago", paid: "—", approved: "—", amount: "600.000,10", note: "Todavía no registramos un pago para este período.", receiptDate: "Sin comprobante cargado" },
  Abril: { title: "Abril 2023", status: "Aprobado", paid: "06/04/2023", approved: "07/04/2023", amount: "600.000,10", commission: "-50.000", total: "650.000,10", note: "Cobro liquidado correctamente. La transferencia al propietario fue programada y el detalle de descuentos está incluido en la liquidación.", receiptDate: "06/04/2023 · 14:32 hs" },
  Febrero: { title: "Febrero 2023", status: "Aprobado", paid: "06/02/2023", approved: "07/02/2023", amount: "600.000,10", commission: "-50.000", total: "650.000,10", note: "Cobro liquidado correctamente. La transferencia al propietario fue programada y el detalle de descuentos está incluido en la liquidación.", receiptDate: "06/02/2023 · 14:32 hs" },
  Enero: { title: "Enero 2023", status: "Rechazado", paid: "06/01/2023", approved: "—", amount: "600.000,10", note: "El comprobante fue rechazado. Revisá los datos y volvé a enviarlo.", receiptDate: "06/01/2023 · 14:32 hs" },
};

function Icon({ src }) {
  return <img className="payments__icon" src={src} alt="" aria-hidden="true" />;
}

function StatusPill({ status, tone }) {
  return <span className={`payments__status payments__status--${tone}`}>{status}</span>;
}

function YearButton({ year, expanded, onClick }) {
  return (
    <button className="payments__year-button" type="button" onClick={onClick} aria-expanded={expanded}>
      <strong>{year}</strong><span className={`payments__chevron${expanded ? " is-open" : ""}`} aria-hidden="true" />
    </button>
  );
}

export default function Payments() {
  const [openYears, setOpenYears] = useState({ 2024: true });
  const [selectedMonth, setSelectedMonth] = useState("Febrero");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const details = useMemo(() => detailsByMonth[selectedMonth], [selectedMonth]);
  const hasReceipt = details.status !== "Sin comprobante" && details.status !== "Impago";
  const statusTone = details.status === "Aprobado" ? "approved" : details.status === "Rechazado" ? "rejected" : "info";

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
    event.target.value = "";
  }

  return (
    <main id="payments">
      <aside className="payments__sidebar" aria-label="Propiedades y períodos">
        <h1>Propiedades</h1>
        <Button className="payments__property-switcher" aria-label="Cambiar propiedad">
          <span aria-hidden="true">‹</span><strong>Bielke 454</strong><span aria-hidden="true">›</span>
        </Button>
        <div className="payments__years">
          <section className="payments__year">
            <YearButton year="2026" expanded={Boolean(openYears[2026])} onClick={() => toggleYear(2026)} />
            {openYears[2026] && <p className="payments__year-empty">No hay períodos disponibles</p>}
          </section>
          <section className="payments__year">
            <YearButton year="2025" expanded={Boolean(openYears[2025])} onClick={() => toggleYear(2025)} />
            {openYears[2025] && <p className="payments__year-empty">No hay períodos disponibles</p>}
          </section>
          <section className="payments__year">
            <YearButton year="2024" expanded={Boolean(openYears[2024])} onClick={() => toggleYear(2024)} />
            {openYears[2024] && <div className="payments__months">
              {months.map((month) => (
                <button key={month.label} className={`payments__month${selectedMonth === month.label ? " is-selected" : ""}`} type="button" onClick={() => selectMonth(month.label)} aria-pressed={selectedMonth === month.label}>
                  <strong>{month.label}</strong><StatusPill status={month.status} tone={month.tone} />
                </button>
              ))}
            </div>}
          </section>
        </div>
      </aside>

      <section className="payments__workspace">
        <section className="payments__summary" aria-label="Resumen de pagos">
          <article className="payments__summary-card payments__summary-card--blue"><span className="payments__metric-icon"><Icon src={fileLinesIcon} /></span><strong>Comprobantes enviados</strong><b>5/9</b></article>
          <article className="payments__summary-card payments__summary-card--green"><span className="payments__metric-icon"><Icon src={checkIcon} /></span><strong>Pagos aprobados</strong><b>5/9</b></article>
          <article className="payments__summary-card payments__summary-card--red"><span className="payments__metric-icon"><Icon src={xIcon} /></span><strong>Pagos rechazados</strong><b>5/9</b></article>
        </section>

        <div className="payments__content">
          <article className="payments__receipt-column">
            <div className={`payments__receipt-frame${hasReceipt ? "" : " is-empty"}`}>
              {hasReceipt ? <div className="payments__receipt-reference" style={{ "--payment-reference": `url(${paymentReference})` }} role="img" aria-label="Comprobante de transferencia BBVA">
                <button className="payments__receipt-zoom" type="button" aria-label="Ampliar comprobante"><Icon src={magnifyingGlassIcon} /><span aria-hidden="true">+</span></button>
              </div> : <div className="payments__empty-receipt"><Icon src={fileLinesIcon} /><span>Sin comprobante</span></div>}
            </div>
            <div className={`payments__uploaded${hasReceipt ? " is-approved" : ""}`}>
              <Icon src={fileLinesIcon} /><span><strong>{uploadedFile ? "Comprobante listo para enviar" : hasReceipt ? "Comprobante cargado" : "Cargar comprobante"}</strong><small>{uploadedFile ? uploadedFile.name : details.receiptDate}</small></span>
            </div>
          </article>

          <section className="payments__detail" aria-labelledby="payment-title">
            <div className="payments__detail-heading"><h1 id="payment-title">{details.title}</h1><span className={`payments__status payments__status--${statusTone}`}>{details.status === "Aprobado" && <Icon src={checkIcon} />}{details.status}</span></div>
            <dl className="payments__facts">
              <div><Icon src={calendarIcon} /><dt>Fecha de cobro:</dt><dd>{details.paid}</dd></div>
              <div><Icon src={calendarIcon} /><dt>Fecha de liquidación:</dt><dd>{details.approved}</dd></div>
              <div><span className="payments__coin-icon" aria-hidden="true">$</span><dt>Monto cobrado:</dt><dd>{details.amount}</dd></div>
              <div><span className="payments__percent-icon" aria-hidden="true">%</span><dt>Comisión inmobiliaria:</dt><dd>{details.commission}</dd></div>
              <div className="payments__facts-total"><span className="payments__coin-icon" aria-hidden="true">$</span><dt>Monto total:</dt><dd>{details.total}</dd></div>
            </dl>
            <aside className={`payments__admin-note${details.status === "Rechazado" ? " is-rejected" : ""}`}><span className="payments__admin-note-icon"><Icon src={fileLinesIcon} /></span><div><strong>Detalle de administración</strong><p>{details.note}</p></div></aside>
            <div className="payments__actions">
              {hasReceipt ? <button className="payments__button payments__button--secondary" type="button" onClick={() => setFeedback("Comprobante descargado")}><Icon src={downloadIcon} /><span>Descargar comprobante</span></button> : <label className="payments__button payments__button--secondary"><Icon src={downloadIcon} /><span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span><input type="file" accept="image/*,.pdf" onChange={uploadReceipt} /></label>}
              <Button className="payments__button payments__button--primary" icon={paperPlaneIcon} text={feedback === "Solicitud de revisión enviada" ? "Enviado para revisión" : "Solicitar revisión"} onClick={() => setFeedback("Solicitud de revisión enviada")} />
            </div>
            <p className="payments__disclaimer">Nota: una vez liquidado el periodo, la información queda disponible para consultas y descarga</p>
            <p className="payments__feedback" aria-live="polite">{feedback}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
