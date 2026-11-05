import { Link } from "wouter";
import {
  calendarIcon,
  chartColumnIcon,
  fileLinesIcon,
  peopleIcon,
  penIcon,
  plusIconWhite,
  toolboxIcon,
  userIcon,
  walletIcon,
} from "../../assets/icons";
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

const activityItems = Array.from({ length: 6 }, () => ({ title: "Nueva visita agendada", detail: "Propiedad: Belgrano 123" }));

const statItems = [
  { label: "Inquilinos", value: "18", change: "+20%", icon: peopleIcon, tone: "green", href: "/tenant" },
  { label: "Reportes", value: "3", change: "+10%", icon: penIcon, tone: "red", href: "/reports-agent" },
  { label: "Cobros P.", value: "4", change: "+20%", icon: walletIcon, tone: "orange", href: "/payments-collections" },
  { label: "Contratos", value: "6", change: "+20%", icon: fileLinesIcon, tone: "purple", href: "/properties" },
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

function PerformanceChart() {
  return (
    <div className="agent-dashboard__chart-wrap">
      <div className="agent-dashboard__chart-y-labels" aria-hidden="true">
        <span>20</span><span>15</span><span>10</span><span>5</span><span>0</span>
      </div>
      <svg className="agent-dashboard__chart" viewBox="0 0 620 210" preserveAspectRatio="none" role="img" aria-label="Rendimiento semanal de visitas y contratos">
        <g className="agent-dashboard__chart-grid">
          <line x1="0" y1="20" x2="620" y2="20" />
          <line x1="0" y1="60" x2="620" y2="60" />
          <line x1="0" y1="100" x2="620" y2="100" />
          <line x1="0" y1="140" x2="620" y2="140" />
          <line x1="0" y1="180" x2="620" y2="180" />
        </g>
        <path className="agent-dashboard__chart-line agent-dashboard__chart-line--yellow" d="M0 76 C35 57 77 58 116 57 S179 68 197 67 S265 43 290 44 S362 61 384 60 S442 72 460 64 S519 58 543 53 S589 43 620 38" />
        <path className="agent-dashboard__chart-line agent-dashboard__chart-line--red" d="M0 130 C34 112 80 111 116 112 S179 120 197 122 S262 97 290 100 S345 120 384 115 S438 133 460 132 S515 121 543 120 S590 110 620 107" />
        <path className="agent-dashboard__chart-line agent-dashboard__chart-line--purple" d="M0 165 C36 144 79 153 116 149 S177 158 197 157 S261 134 290 137 S348 153 384 151 S438 168 460 167 S516 157 543 156 S589 144 620 143" />
      </svg>
      <div className="agent-dashboard__chart-x-labels" aria-hidden="true">
        <span>Lun 8</span><span>Mar 9</span><span>Mie 10</span><span>Jue 11</span><span>Vie 12</span><span>Sab 13</span><span>Dom 14</span>
      </div>
    </div>
  );
}

function PerformanceCard() {
  return (
    <section className="agent-dashboard__card agent-dashboard__performance-card" aria-labelledby="agent-performance-title">
      <header className="agent-dashboard__section-heading agent-dashboard__performance-heading">
        <Icon src={chartColumnIcon} />
        <div>
          <h2 id="agent-performance-title">Rendimiento de la semana</h2>
          <p>Visitas a la pagina, visitas a propiedades y contratos<span className="agent-dashboard__performance-period"> en los últimos 7 días</span></p>
        </div>
        <label className="agent-dashboard__period-select">
          <span className="sr-only">Periodo del gráfico</span>
          <select defaultValue="week">
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </label>
      </header>

      <PerformanceChart />

      <div className="agent-dashboard__chart-legend" aria-label="Referencias del gráfico">
        <span><i className="is-yellow" />Visitas a la pagina</span>
        <span><i className="is-red" />Visitas a propiedades</span>
        <span><i className="is-purple" />Contratos</span>
      </div>

      <div className="agent-dashboard__stats">
        {statItems.map((item) => (
          <Link className={`agent-dashboard__stat agent-dashboard__stat--${item.tone}`} href={item.href} key={item.label}>
            <span className="agent-dashboard__stat-icon"><Icon src={item.icon} /></span>
            <span className="agent-dashboard__stat-copy"><b>{item.label}</b><strong>{item.value}</strong></span>
            <span className="agent-dashboard__stat-change">↗ {item.change}</span>
          </Link>
        ))}
      </div>
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

function ActivityCard() {
  return (
    <section className="agent-dashboard__card agent-dashboard__activity-card" aria-labelledby="agent-activity-title">
      <header className="agent-dashboard__activity-heading">
        <h2 id="agent-activity-title"><span aria-hidden="true">◷</span>Actividad reciente</h2>
        <Link href="/schedule">Ver todas</Link>
        <button type="button" aria-label="Actividad anterior">‹</button>
        <button type="button" aria-label="Actividad siguiente">›</button>
      </header>
      <div className="agent-dashboard__activity-grid">
        {activityItems.map((item, index) => (
          <article className="agent-dashboard__activity-item" key={`${item.title}-${index}`}>
            <span className="agent-dashboard__activity-icon"><Icon src={calendarIcon} /></span>
            <span><strong>{item.title}</strong><small>{item.detail}</small></span>
            <time>Hace 2 h</time>
          </article>
        ))}
      </div>
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
          <PerformanceCard />
          <ReportsCard />
          <ActivityCard />
        </div>
      </div>
    </main>
  );
}
