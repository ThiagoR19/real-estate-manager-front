import { Link } from "wouter";
import {
  calendarIcon,
  plusIconWhite,
  toolboxIcon,
  userIcon,
} from "../../assets/icons";
import { ActivityCard as SharedActivityCard, PerformanceCard as SharedPerformanceCard } from "../dashboard/DashboardWidgets";
import "./AgentDashboard.css";

const propertyPhotos = [
  "/images (1).jpg",
  "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg",
  "/images.jpg",
];

const agendaItems = [
  { time: "10:00", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[1] },
  { time: "11:00", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[0] },
  { time: "14:00", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[2] },
  { time: "15:30", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[0] },
  { time: "16:00", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[1] },
  { time: "17:00", title: "Casa de San isidro", address: "Av. Libertador 4500", person: "Laura Gomez", photo: propertyPhotos[2] },
];

const reports = [
  { title: "Fuga de gas", person: "Sofia Ramirez", property: "Casa de san isidro", photo: propertyPhotos[1] },
  { title: "Pared hume...", person: "Sofia Ramirez", property: "Casa de san isidro", photo: propertyPhotos[2] },
  { title: "Humedad", person: "Sofia Ramirez", property: "Casa de san isidro", photo: propertyPhotos[0] },
];

function Icon({ src, className = "" }) {
  return <img className={className} src={src} alt="" aria-hidden="true" />;
}

function AgendaCard() {
  return (
    <section className="agent-dashboard__card agent-dashboard__agenda-card" aria-labelledby="agent-agenda-title">
      <header className="agent-dashboard__section-heading">
        <Icon src={calendarIcon} />
        <h2 id="agent-agenda-title">Agenda del día</h2>
        <time dateTime="2025-09-09">Martes, 9 de septiembre 2025</time>
      </header>

      <div className="agent-dashboard__agenda-list">
        {agendaItems.map((item) => (
          <article className="agent-dashboard__agenda-item" key={`${item.time}-${item.title}`}>
            <time>{item.time}</time>
            <span className="agent-dashboard__agenda-line" aria-hidden="true" />
            <img className="agent-dashboard__agenda-photo" src={item.photo} alt="" />
            <div className="agent-dashboard__agenda-copy">
              <strong>{item.title}</strong>
              <span>{item.address}</span>
              <small><Icon src={userIcon} />{item.person}</small>
            </div>
          </article>
        ))}
      </div>

      <Link className="agent-dashboard__subtle-button" href="/schedule">Ver agenda completa <span aria-hidden="true">→</span></Link>
    </section>
  );
}

function ReportsCard() {
  return (
    <section className="agent-dashboard__card agent-dashboard__reports-card" aria-labelledby="agent-reports-title">
      <header className="agent-dashboard__section-heading">
        <Icon src={toolboxIcon} />
        <h2 id="agent-reports-title">Reportes de inquilinos</h2>
        <span className="agent-dashboard__pending">2 pendientes</span>
        <span className="agent-dashboard__heading-chevron" aria-hidden="true">›</span>
      </header>

      <div className="agent-dashboard__reports-list">
        {reports.map((report) => (
          <Link className="agent-dashboard__report-item" href="/reports-agent" key={report.title}>
            <img src={report.photo} alt="" />
            <span className="agent-dashboard__report-copy">
              <strong>{report.title} <i aria-hidden="true" /></strong>
              <span>{report.person}</span>
              <span>{report.property}</span>
            </span>
            <small>Hace 1 día</small>
            <b aria-hidden="true">›</b>
          </Link>
        ))}
      </div>

      <Link className="agent-dashboard__reports-button" href="/reports-agent">Todos los reportes <span aria-hidden="true">→</span></Link>
    </section>
  );
}

export default function AgentDashboard() {
  return (
    <main id="agent-dashboard">
      <div className="agent-dashboard__page">
        <header className="agent-dashboard__intro">
          <div>
            <h1>¡Hola, Thiago!</h1>
            <p>Aquí tienes un resumen de la actividad de la inmobiliaria</p>
          </div>
          <Link className="agent-dashboard__schedule-button" href="/schedule"><Icon src={plusIconWhite} />Agendar cita</Link>
        </header>

        <div className="agent-dashboard__grid">
          <AgendaCard />
          <SharedPerformanceCard className="agent-dashboard__performance-card" />
          <ReportsCard />
          <SharedActivityCard />
        </div>
      </div>
    </main>
  );
}

