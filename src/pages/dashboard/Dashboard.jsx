import { useState } from "react";
import { Link } from "wouter";
import { angleDownIcon, calendarIcon, chartColumnIcon, clockIcon, fileLinesIcon, houseIcon, peopleIcon, penIcon, plusIconWhite, tagIcon, userIcon } from "../../assets/icons";
import keyIcon from "../../assets/icons/llaveNosotrosIcon.svg";
import "./Dashboard.css";

const agents = [
  { name: "Sofia ramirez", initials: "SR", className: "dashboard-avatar--violet" },
  { name: "Hernesto Hernesto", initials: "HH", className: "dashboard-avatar--blue" },
  { name: "Brayan kevin", initials: "BK", className: "dashboard-avatar--sand" },
  { name: "Doc.ing", initials: "DI", className: "dashboard-avatar--peach" },
  { name: "Brum Ramirez", initials: "BR", className: "dashboard-avatar--silver" },
];

const chartSeries = [
  { color: "#f1c400", values: [11.8, 13.5, 13.2, 16.8, 14.8, 13.6, 15.8] },
  { color: "#fa2929", values: [5.8, 7.3, 6.7, 10.4, 8.4, 7.3, 9.9] },
  { color: "#8127f6", values: [1.7, 3.3, 2.6, 6.2, 4.4, 3.1, 5.8] },
];

const activityItems = Array.from({ length: 6 }, () => ({ title: "Nueva visita agendada", property: "Belgrano 123", time: "Hace 2 h" }));

function Icon({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function chartPath(values, width = 560, height = 160) {
  const step = width / (values.length - 1);
  const points = values.map((value, index) => [index * step, height - (value / 20) * height]);
  return points.reduce((path, point, index) => {
    if (!index) return `M ${point.join(" ")}`;
    const previous = points[index - 1];
    const before = points[index - 2] || previous;
    const after = points[index + 1] || point;
    const first = [previous[0] + (point[0] - before[0]) / 6, previous[1] + (point[1] - before[1]) / 6];
    const second = [point[0] - (after[0] - previous[0]) / 6, point[1] - (after[1] - previous[1]) / 6];
    return `${path} C ${first.join(" ")} ${second.join(" ")} ${point.join(" ")}`;
  }, "");
}

function PerformanceChart() {
  const labels = ["Lun 8", "Mar 9", "Mie 10", "Jue 11", "Vie 12", "Sab 13", "Dom 14"];
  const yTicks = [0, 5, 10, 15, 20];
  return (
    <div className="dashboard-chart" aria-label="Gráfico de rendimiento semanal">
      <svg viewBox="0 0 600 190" preserveAspectRatio="none" role="img">
        <g className="dashboard-chart__grid">
          {yTicks.map((tick) => <line key={tick} x1="30" x2="590" y1={170 - (tick / 20) * 160} y2={170 - (tick / 20) * 160} />)}
        </g>
        <g className="dashboard-chart__axis-labels">
          {yTicks.map((tick) => <text key={tick} x="8" y={174 - (tick / 20) * 160}>{tick}</text>)}
          {labels.map((label, index) => <text key={label} x={30 + index * (560 / 6)} y="188" textAnchor="middle">{label}</text>)}
        </g>
        <g transform="translate(30 10)">
          {chartSeries.map((series) => <path key={series.color} d={chartPath(series.values)} stroke={series.color} />)}
        </g>
      </svg>
      <div className="dashboard-chart__legend" aria-hidden="true">
        <span><i className="dashboard-legend-dot dashboard-legend-dot--yellow" />Visitas la pagina</span>
        <span><i className="dashboard-legend-dot dashboard-legend-dot--red" />Visitas a propiedades</span>
        <span><i className="dashboard-legend-dot dashboard-legend-dot--purple" />Contratos</span>
      </div>
    </div>
  );
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

function PerformanceCard() {
  const [period, setPeriod] = useState("Esta semana");
  return (
    <section className="dashboard-card dashboard-performance-card">
      <div className="dashboard-performance-card__header">
        <div><h2 className="dashboard-card__title"><Icon src={chartColumnIcon} />Rendimiento de la semana</h2><p>Visitas a la pagina, visitas a propiedades y contratos<span className="dashboard-performance-period"> en los últimos 7 días</span></p></div>
        <label className="dashboard-period-select"><span className="visually-hidden">Período del gráfico</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Esta semana</option><option>Este mes</option><option>Este año</option></select><Icon src={angleDownIcon} /></label>
      </div>
      <PerformanceChart />
      <div className="dashboard-kpis">
        <div className="dashboard-kpi dashboard-kpi--green"><span className="dashboard-kpi__icon"><Icon src={userIcon} /></span><span><small>inquilinos</small><b>18 <em>↑ +20%</em></b></span></div>
        <div className="dashboard-kpi dashboard-kpi--red"><Icon src={fileLinesIcon} /><span><small>Reportes</small><b>3 <em>↑ +10%</em></b></span></div>
        <div className="dashboard-kpi dashboard-kpi--orange"><span className="dashboard-kpi__symbol">$</span><span><small>Cobros P.</small><b>3 <em>↑ +20%</em></b></span></div>
        <div className="dashboard-kpi dashboard-kpi--purple"><Icon src={fileLinesIcon} /><span><small>Contratos</small><b>6 <em>↑ +20%</em></b></span></div>
      </div>
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

function ActivityCard() {
  const [offset, setOffset] = useState(0);
  return (
    <section className="dashboard-card dashboard-activity-card">
      <div className="dashboard-activity-card__heading"><h2 className="dashboard-card__title"><Icon src={clockIcon} />Actividad reciente</h2><div className="dashboard-activity-actions"><button type="button" onClick={() => setOffset(0)}>Ver todas</button><button type="button" aria-label="Actividad anterior" onClick={() => setOffset(0)}>‹</button><button type="button" aria-label="Actividad siguiente" onClick={() => setOffset(offset === 0 ? 3 : 0)}>›</button></div></div>
      <div className="dashboard-activity-list">
        {activityItems.slice(offset, offset + 3).map((item, index) => <div className="dashboard-activity-item" key={`${item.title}-${index}`}>
          <span className="dashboard-activity-item__icon"><Icon src={calendarIcon} /></span><div><strong>{item.title}</strong><small>Propiedad: {item.property}</small></div><time>{item.time}</time>
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
      <div className="dashboard-content"><AgentsCard /><PerformanceCard /><StatusCard /><ActivityCard /></div>
    </main>
  );
}

