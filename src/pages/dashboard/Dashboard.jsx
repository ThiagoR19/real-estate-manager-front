import { Link } from "wouter";
import { houseIcon, peopleIcon, penIcon, plusIconWhite, tagIcon } from "../../assets/icons";
import keyIcon from "../../assets/icons/llaveNosotrosIcon.svg";
import { ActivityCard as SharedActivityCard, PerformanceCard as SharedPerformanceCard } from "./DashboardWidgets";
import "./Dashboard.css";

const agents = [
  { name: "Sofia ramirez", initials: "SR", className: "dashboard-avatar--violet" },
  { name: "Hernesto Hernesto", initials: "HH", className: "dashboard-avatar--blue" },
  { name: "Brayan kevin", initials: "BK", className: "dashboard-avatar--sand" },
  { name: "Doc.ing", initials: "DI", className: "dashboard-avatar--peach" },
  { name: "Brum Ramirez", initials: "BR", className: "dashboard-avatar--silver" },
];

function Icon({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function AgentsCard() {
  return (
    <section className="dashboard-card dashboard-agents-card">
      <h2 className="dashboard-card__title"><Icon src={peopleIcon} />Top Agentes</h2>
      <div className="dashboard-agents-list">
        {agents.map((agent) => <div className="dashboard-agent" key={agent.name}>
          <div className={`dashboard-avatar ${agent.className}`} aria-hidden="true">{agent.initials}</div>
          <strong>{agent.name}</strong>
          <div className="dashboard-agent__stats"><span>• 8 Ventas</span><span>• 8 Alq</span></div>
        </div>)}
      </div>
      <Link className="dashboard-outline-button" href="/agents">Ver todos los agentes <span aria-hidden="true">→</span></Link>
    </section>
  );
}

function StatusCard() {
  const statusItems = [
    { label: "Total de propiedades:", value: "35", icon: houseIcon },
    { label: "Total en alquiler:", value: "10", icon: keyIcon },
    { label: "Propiedades vendidas:", value: "10", icon: houseIcon },
    { label: "Propiedades vacias:", value: "25", icon: tagIcon },
  ];
  return (
    <section className="dashboard-card dashboard-status-card">
      <div className="dashboard-status-card__heading"><h2 className="dashboard-card__title"><Icon src={penIcon} />Estados</h2><Link href="/properties" aria-label="Ver propiedades">›</Link></div>
      <div className="dashboard-status-list">
        {statusItems.map((item) => <div className="dashboard-status-item" key={item.label}>
          <strong>{item.label}</strong><b>{item.value}</b><Icon src={item.icon} />
        </div>)}
      </div>
    </section>
  );
}

export default function Dashboard() {
  return (
    <main className="dashboard-page">
      <div className="dashboard-page__background" aria-hidden="true" />
      <header className="dashboard-hero"><div><h1>¡Hola, Thiago!</h1><p><span className="dashboard-hero__desktop-copy">Aquí tienes un resumen de la actividad de la inmobiliaria</span><span className="dashboard-hero__mobile-copy">Aquí tienes un resumen de tu inmobiliaria</span></p></div><Link className="dashboard-appointment-button" href="/schedule"><img src={plusIconWhite} alt="" aria-hidden="true" />Agendar cita</Link></header>
      <div className="dashboard-content"><AgentsCard /><SharedPerformanceCard /><StatusCard /><SharedActivityCard className="dashboard-shared-activity" /></div>
    </main>
  );
}

