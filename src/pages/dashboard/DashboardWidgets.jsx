import { useState } from "react";
import { Link } from "wouter";
import { angleDownIcon, calendarIcon, chartColumnIcon, fileLinesIcon, userIcon } from "../../assets/icons";
import "./Dashboard.css";
import "../agentDashboard/AgentDashboard.css";

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
        <g className="dashboard-chart__axis-labels" vectorEffect="non-scaling-size">
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

export function PerformanceCard({ className = "" }) {
  const [period, setPeriod] = useState("Esta semana");
  return (
    <section className={`dashboard-card dashboard-performance-card ${className}`}>
      <div className="dashboard-performance-card__header">
        <div>
          <h2 className="dashboard-card__title"><Icon src={chartColumnIcon} />Rendimiento de la semana</h2>
          <p>Visitas a la pagina, visitas a propiedades y contratos<span className="dashboard-performance-period"> en los últimos 7 días</span></p>
        </div>
        <label className="dashboard-period-select">
          <span className="visually-hidden">Período del gráfico</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option>Esta semana</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select><Icon src={angleDownIcon} />
        </label>
      </div>
      <PerformanceChart />
      <div className="dashboard-kpis">
        <div className="dashboard-kpi dashboard-kpi--green">
          <span className="dashboard-kpi__icon"><Icon src={userIcon} /></span>
          <span><small>inquilinos</small><b>18 <em>↑ +20%</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--red">
          <Icon src={fileLinesIcon} />
          <span><small>Reportes</small><b>3 <em>↑ +10%</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--orange">
          <span className="dashboard-kpi__symbol">$</span>
          <span><small>Cobros P.</small><b>3 <em>↑ +20%</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--purple">
          <Icon src={fileLinesIcon} />
          <span><small>Contratos</small><b>6 <em>↑ +20%</em></b></span>
        </div>
      </div>
    </section>
  );
}

export function ActivityCard({ className = "agent-dashboard__card agent-dashboard__activity-card" }) {
  const [offset, setOffset] = useState(0);
  return (
    <section className={`dashboard-card dashboard-activity-card ${className}`} aria-labelledby="agent-activity-title">
      <header className="agent-dashboard__activity-heading">
        <h2 id="agent-activity-title"><span aria-hidden="true">◷</span>Actividad reciente</h2>
        <Link href="/schedule">Ver todas</Link>
        <button type="button" aria-label="Actividad anterior" onClick={() => setOffset(offset === 0 ? 3 : 0)}>‹</button>
        <button type="button" aria-label="Actividad siguiente" onClick={() => setOffset(offset === 0 ? 3 : 0)}>›</button>
      </header>
      <div className="agent-dashboard__activity-grid">
        {activityItems.slice(offset, offset + 6).map((item, index) => (
          <article className="agent-dashboard__activity-item" key={`${item.title}-${index}`}>
            <span className="agent-dashboard__activity-icon"><Icon src={calendarIcon} /></span>
            <span><strong>{item.title}</strong><small>Propiedad: {item.property}</small></span>
            <time>{item.time}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
