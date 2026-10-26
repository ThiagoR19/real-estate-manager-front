import { Link } from "wouter";
import {
  bellIcon,
  checkIcon,
  circleInfoIcon,
  fileLinesIcon,
  penIcon,
  xIcon,
} from "../../assets/icons";
import "./DashboardInquilino.css";

const agendaItems = [
  { time: "20:00", title: "Vencimiento contrato", date: "24 de agosto", icon: fileLinesIcon },
  { time: "18:00", title: "Aprobación de pago", date: "24 de agosto", icon: "payment" },
  { time: "10:00", title: "Rechazo de pago", date: "24 de agosto", icon: "payment" },
  { time: "20:00", title: "Recordatorio de pago", date: "23 de agosto", icon: bellIcon },
];

const paymentSummaries = [
  { label: "Comprobantes enviados", value: "5/9", icon: fileLinesIcon, tone: "info" },
  { label: "Pagos aprobados", value: "5/9", icon: checkIcon, tone: "success" },
  { label: "Pagos rechazados", value: "5/9", icon: xIcon, tone: "danger" },
];

function AgendaIcon({ icon }) {
  if (icon === "payment") {
    return <span className="tenant-dashboard__card-icon" aria-hidden="true"><span /></span>;
  }

  return <img src={icon} alt="" />;
}

function AgendaCard() {
  return (
    <section className="tenant-dashboard__card tenant-dashboard__agenda" aria-labelledby="agenda-title">
      <header className="tenant-dashboard__card-heading">
        <img src={bellIcon} alt="" />
        <h2 id="agenda-title">Agenda del día</h2>
      </header>

      <div className="tenant-dashboard__timeline">
        {agendaItems.map((item) => (
          <article className="tenant-dashboard__event" key={`${item.time}-${item.title}`}>
            <time>{item.time}</time>
            <span className="tenant-dashboard__event-marker" aria-hidden="true" />
            <span className="tenant-dashboard__event-icon"><AgendaIcon icon={item.icon} /></span>
            <div className="tenant-dashboard__event-copy">
              <strong>{item.title}</strong>
              <small>{item.date}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PaymentSummary({ item }) {
  return (
    <div className={`tenant-dashboard__payment tenant-dashboard__payment--${item.tone}`}>
      <span className="tenant-dashboard__payment-icon"><img src={item.icon} alt="" /></span>
      <strong>{item.label}</strong>
      <b>{item.value}</b>
    </div>
  );
}

function RentalStatusCard() {
  return (
    <section className="tenant-dashboard__card tenant-dashboard__status" aria-labelledby="status-title">
      <header className="tenant-dashboard__card-heading tenant-dashboard__status-heading">
        <span className="tenant-dashboard__info-icon"><img src={circleInfoIcon} alt="" /></span>
        <div>
          <h2 id="status-title">Estado de el inquilino</h2>
          <p>Aquí vera datos que le podra servir para tener una estancia correcta y comoda</p>
        </div>
      </header>

      <div className="tenant-dashboard__status-content">
        <p className="tenant-dashboard__rental-label">Mi alquiler</p>
        <h3>Contrato de 24 meses <span>(Restan 12 meses)</span></h3>

        <div className="tenant-dashboard__progress" role="progressbar" aria-label="Progreso del contrato" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <span>50%</span>
        </div>
        <div className="tenant-dashboard__contract-dates">
          <span>Inicio:01/11/2025</span>
          <span>Fin:01/11/2027</span>
        </div>

        <h4>Resumenes de pagos</h4>
        <div className="tenant-dashboard__payments">
          {paymentSummaries.map((item) => <PaymentSummary item={item} key={item.label} />)}
        </div>
      </div>
    </section>
  );
}

function ReportsCard() {
  return (
    <section className="tenant-dashboard__card tenant-dashboard__reports" aria-labelledby="reports-title">
      <header className="tenant-dashboard__card-heading">
        <img src={penIcon} alt="" />
        <h2 id="reports-title">Reportes</h2>
      </header>

      <div className="tenant-dashboard__reports-message">
        <p>¿Tiene algun problema la propiedad?<br />Envíe un reporte del problema y no<br />encargaremos de solucionarlo</p>
        <span className="tenant-dashboard__face" aria-hidden="true" />
      </div>

      <Link className="tenant-dashboard__reports-button" href="/reports">
        <span>Ir a reportes</span>
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardInquilino() {
  return (
    <main id="tenant-dashboard">
      <div className="tenant-dashboard__page">
        <header className="tenant-dashboard__intro">
          <h1>¡Hola, Thiago!</h1>
          <p>Aquí tienes un resumen de la actividad del alquiler</p>
        </header>

        <div className="tenant-dashboard__grid">
          <AgendaCard />
          <RentalStatusCard />
          <ReportsCard />
        </div>
      </div>
    </main>
  );
}
