import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { angleDownIcon, calendarIcon, chartColumnIcon, fileLinesIcon, userIcon } from "../../assets/icons";
import "./Dashboard.css";
import "../agentDashboard/AgentDashboard.css";

const chartSeries = [
  { key: "visitasLanding", color: "#f1c400", label: "Visitas a la página" },
  { key: "visitasPropiedades", color: "#fa2929", label: "Visitas a propiedades" },
  { key: "contratosVigentes", color: "#8127f6", label: "Contratos" },
];

const periods = {
  semana: { option: "Esta semana", title: "Rendimiento de la semana", detail: " de esta semana" },
  mes: { option: "Este mes", title: "Rendimiento del mes", detail: " de este mes" },
  anio: { option: "Este año", title: "Rendimiento del año", detail: " de este año" },
};

const weekDays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const fullMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function porcentaje(actual, anterior){
  if (anterior == null || anterior == 0){
    anterior = 1
  }
  let total = Math.round((actual*100)/anterior)
  let devolver
  let peor = false
  if (total>=100){
    total= total - 100
    devolver = `↑ ${total}%`
    peor = true
  }
  else{
    devolver = `↓ ${(100-total)}%`
  }
  return {devolver,peor}
}
const VISITAS_POR_PAGINA = 10;

function visitTime(fecha) {
  const date = new Date(fecha);
  const hora = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const esHoy = date.toDateString() === new Date().toDateString();
  return esHoy ? `Hoy ${hora}` : `${date.getDate()}/${date.getMonth() + 1} ${hora}`;
}

function Icon({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

// Etiqueta del eje X según el período: "Lun 9", "9" o "Nov"
function pointLabel(point, period) {
  if (period === "anio") return months[point.mes - 1];
  const [year, month, day] = point.fecha.split("-").map(Number);
  if (period === "mes") return String(day);
  return `${weekDays[new Date(year, month - 1, day).getDay()]} ${day}`;
}

function tooltipLabel(point, period) {
  if (period === "anio") return fullMonths[point.mes - 1];
  const [year, month, day] = point.fecha.split("-").map(Number);
  return `${weekDays[new Date(year, month - 1, day).getDay()]} ${day} de ${fullMonths[month - 1].toLowerCase()}`;
}

// Valor de una serie en un punto; null si el día o el mes todavía no llegó
function pointValue(point, key) {
  const future = point.contratosVigentes === null;
  if (future && key !== "visitasPropiedades") return null;
  return point[key] ?? null;
}

// Máximo redondeado del eje Y para que queden 4 divisiones con números enteros
function chartMax(values) {
  const max = Math.max(4, ...values);
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough);
  return step * 4;
}

function chartPath(values, max) {
  const lastIndex = Math.max(values.length - 1, 1);
  const toPoint = (value, index) => [(index / lastIndex) * 100, 100 - (value / max) * 100];
  const clampY = (y) => Math.min(100, Math.max(0, y));
  const segments = [];
  let current = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push(toPoint(value, index));
  });
  if (current.length) segments.push(current);

  return segments.map((points) => {
    if (points.length === 1) return `M ${points[0].join(" ")} l 0 0`;
    return points.reduce((path, point, index) => {
      if (!index) return `M ${point.join(" ")}`;
      const previous = points[index - 1];
      const before = points[index - 2] || previous;
      const after = points[index + 1] || point;
      const first = [previous[0] + (point[0] - before[0]) / 6, clampY(previous[1] + (point[1] - before[1]) / 6)];
      const second = [point[0] - (after[0] - previous[0]) / 6, clampY(point[1] - (after[1] - previous[1]) / 6)];
      return `${path} C ${first.join(" ")} ${second.join(" ")} ${point.join(" ")}`;
    }, "");
  }).join(" ");
}

function PerformanceChart({ points, period }) {
  const series = chartSeries.map((item) => ({ ...item, values: points.map((point) => pointValue(point, item.key)) }));
  const max = chartMax(series.flatMap((item) => item.values).filter((value) => value !== null));
  const yTicks = [0, 1, 2, 3, 4].map((index) => (max / 4) * index);
  const labelStep = Math.ceil(points.length / 16);
  const mobileLabelStep = Math.ceil(points.length / 8);
  const lastIndex = Math.max(points.length - 1, 1);
  const [active, setActive] = useState(null);
  const hovered = active !== null && active < points.length ? active : null;

  const handlePointer = (event) => {
    if (!points.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setActive(Math.min(points.length - 1, Math.round(ratio * lastIndex)));
  };

  const hoverLeft = hovered === null ? 0 : (hovered / lastIndex) * 100;
  const tooltipSide = hoverLeft > 70 ? " dashboard-chart__tooltip--left" : hoverLeft < 30 ? " dashboard-chart__tooltip--right" : "";

  return (
    <div className="dashboard-chart" aria-label={`Gráfico de ${periods[period].title.toLowerCase()}`}>
      <div className="dashboard-chart__plot" onPointerMove={handlePointer} onPointerDown={handlePointer} onPointerLeave={() => setActive(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-hidden="true">
          <g className="dashboard-chart__grid">
            {yTicks.map((tick) => <line key={tick} x1="0" x2="100" y1={100 - (tick / max) * 100} y2={100 - (tick / max) * 100} />)}
          </g>
          {series.map((item) => <path key={item.key} d={chartPath(item.values, max)} stroke={item.color} />)}
        </svg>
        {yTicks.map((tick) => <span className="dashboard-chart__y-label" key={tick} style={{ top: `${100 - (tick / max) * 100}%` }}>{tick}</span>)}
        {points.map((point, index) => index % labelStep === 0 && (
          <span className={`dashboard-chart__x-label${index % mobileLabelStep ? " dashboard-chart__x-label--extra" : ""}`} key={point.fecha ?? point.mes} style={{ left: `${(index / lastIndex) * 100}%` }}>{pointLabel(point, period)}</span>
        ))}
        {hovered !== null && (
          <>
            <span className="dashboard-chart__guide" style={{ left: `${hoverLeft}%` }} />
            {series.map((item) => item.values[hovered] !== null && (
              <span className="dashboard-chart__dot" key={item.key} style={{ left: `${hoverLeft}%`, top: `${Math.min(100, Math.max(0, 100 - (item.values[hovered] / max) * 100))}%`, background: item.color }} />
            ))}
            <div className={`dashboard-chart__tooltip${tooltipSide}`} style={{ left: `${hoverLeft}%` }} role="status">
              <strong>{tooltipLabel(points[hovered], period)}</strong>
              {series.map((item) => (
                <span key={item.key}><i style={{ background: item.color }} />{item.label}<b>{item.values[hovered] ?? "—"}</b></span>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="dashboard-chart__legend" aria-hidden="true">
        <span><i className="dashboard-legend-dot dashboard-legend-dot--yellow" />Visitas la pagina</span>
        <span><i className="dashboard-legend-dot dashboard-legend-dot--red" />Visitas a propiedades</span>
        <span><i className="dashboard-legend-dot dashboard-legend-dot--purple" />Contratos</span>
      </div>
    </div>
  );
}

export function PerformanceCard({indicadores, grafico = {}}) {
  const [period, setPeriod] = useState("semana");

  const indi =[ 
    porcentaje(indicadores.inquilinosActivos.actual, indicadores.inquilinosActivos.anterior),
    porcentaje(indicadores.reportesVigentes.actual, indicadores.reportesVigentes.anterior),
    porcentaje(indicadores.pagosAprobados.actual, indicadores.pagosAprobados.anterior),
    porcentaje(indicadores.contratosFirmados.actual, indicadores.contratosFirmados.anterior)
  ]
  
  return (
    <section className={`dashboard-card dashboard-performance-card`}>
      <div className="dashboard-performance-card__header">
        <div>
          <h2 className="dashboard-card__title"><Icon src={chartColumnIcon} />{periods[period].title}</h2>
          <p>Visitas a la pagina, visitas a propiedades y contratos<span className="dashboard-performance-period">{periods[period].detail}</span></p>
        </div>
        <label className="dashboard-period-select">
          <span className="visually-hidden">Período del gráfico</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            {Object.entries(periods).map(([value, { option }]) => <option key={value} value={value}>{option}</option>)}
          </select><Icon src={angleDownIcon} />
        </label>
      </div>
      <PerformanceChart points={grafico[period] ?? []} period={period} />
      <div className="dashboard-kpis">
        <div className={`dashboard-kpi dashboard-kpi--green`}>
          <span className="dashboard-kpi__icon"><Icon src={userIcon} /></span>
          <span><small>inquilinos</small><b className={indi[0].peor? "Dashboard--green" : "Dashboard--red"}>{indicadores.inquilinosActivos.actual} <em>{indi[0].devolver}</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--red">
          <Icon src={fileLinesIcon} />
          <span><small>Reportes</small><b className={indi[1].peor? "Dashboard--green" : "Dashboard--red"}>{indicadores.reportesVigentes.actual} <em>{indi[1].devolver}</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--orange">
          <span className="dashboard-kpi__symbol">$</span>
          <span><small>Cobros P.</small><b className={indi[2].peor? "Dashboard--green" : "Dashboard--red"}>{indicadores.pagosAprobados.actual}<em>{indi[2].devolver}</em></b></span>
        </div>
        <div className="dashboard-kpi dashboard-kpi--purple">
          <Icon src={fileLinesIcon} />
          <span><small>Contratos</small><b className={indi[3].peor? "Dashboard--green" : "Dashboard--red"}>{indicadores.contratosFirmados.actual} <em>{indi[3].devolver }</em></b></span>
        </div>
      </div>
    </section>
  );
}

export function ActivityCard({ className = "agent-dashboard__card agent-dashboard__activity-card" }) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visitas, setVisitas] = useState([]);
  const [vista, setVista] = useState({ pagina: 0, direccion: "siguiente" });

  useEffect(() => {
    let vigente = true;
    const hoy = new Date().toLocaleDateString("en-CA");
    api.visits({ desde: hoy, estado: "Programada", page, limit: VISITAS_POR_PAGINA })
      .then((resultado) => {
        if (!vigente) return;
        setVisitas(resultado.data);
        setTotalPages(resultado.paginacion?.paginas || 1);
        setVista((anterior) => anterior.pagina === page
          ? anterior
          : { pagina: page, direccion: page > anterior.pagina ? "siguiente" : "anterior" });
      })
      .catch(() => vigente && setVisitas([]));
    return () => { vigente = false; };
  }, [page]);

  return (
    <section className={`dashboard-card dashboard-activity-card ${className}`} aria-labelledby="agent-activity-title">
      <header className="agent-dashboard__activity-heading">
        <h2 id="agent-activity-title"><span aria-hidden="true">◷</span>Actividad reciente</h2>
        <Link href="/schedule">Ver todas</Link>
        <button type="button" aria-label="Actividad anterior" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        <button type="button" aria-label="Actividad siguiente" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
      </header>
      <div className={`agent-dashboard__activity-grid dashboard-activity-slide dashboard-activity-slide--${vista.direccion}`} key={vista.pagina}>
        {visitas.length === 0 && <p className="dashboard-activity-empty">No hay visitas programadas.</p>}
        {visitas.map((visita) => (
          <article className="agent-dashboard__activity-item" key={visita.id}>
            <span className="agent-dashboard__activity-icon"><Icon src={calendarIcon} /></span>
            <span><strong>Visita con {visita.clienteNombre} {visita.clienteApellido}</strong><small>Propiedad: {visita.propiedad}</small></span>
            <time dateTime={visita.fecha}>{visitTime(visita.fecha)}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
