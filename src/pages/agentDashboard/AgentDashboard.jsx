import { useEffect, useState } from "react";
import { Link } from "wouter";
import { calendarIcon, plusIconWhite, toolboxIcon, userIcon } from "../../assets/icons";
import {
  ActivityCard as SharedActivityCard,
  PerformanceCard as SharedPerformanceCard,
  mostrarToast,
} from "../../components";
import { api } from "../../services/api";
import fotoPorDefecto from "/images (1).jpg";
import "./AgentDashboard.css";

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
const PRIORIDADES_ALTAS = ["ALTA", "URGENTE"];

function Icon({ src, className = "" }) {
  return <img className={className} src={src} alt="" aria-hidden="true" />;
}

function imagen(carpeta, nombre) {
  return nombre ? api.assetUrl(`/uploads/${carpeta}/${nombre}`) : fotoPorDefecto;
}

function fechaLarga(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const texto = new Date(anio, mes - 1, dia).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function hora(fecha) {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  });
}

function hace(fecha) {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  return `Hace ${dias} días`;
}

function AgendaCard({ fecha, agenda }) {
  return (
    <section
      className="agent-dashboard__card agent-dashboard__agenda-card"
      aria-labelledby="agent-agenda-title"
    >
      <header className="agent-dashboard__section-heading">
        <Icon src={calendarIcon} />
        <h2 id="agent-agenda-title">Agenda del día</h2>
        <time dateTime={fecha}>{fechaLarga(fecha)}</time>
      </header>

      <div className="agent-dashboard__agenda-list">
        {agenda.length === 0 && (
          <p className="dashboard-activity-empty">No tenés visitas agendadas para hoy.</p>
        )}
        {agenda.map((visita) => (
          <article className="agent-dashboard__agenda-item" key={visita.id}>
            <time dateTime={visita.fecha}>{hora(visita.fecha)}</time>
            <span className="agent-dashboard__agenda-line" aria-hidden="true" />
            <img
              className="agent-dashboard__agenda-photo"
              src={imagen("propiedades", visita.propiedadImagen)}
              alt=""
            />
            <div className="agent-dashboard__agenda-copy">
              <strong>{visita.propiedad}</strong>
              <span>{visita.propiedadUbicacion || "Sin ubicación"}</span>
              <small>
                <Icon src={userIcon} />
                {visita.clienteNombre
                  ? `${visita.clienteNombre} ${visita.clienteApellido ?? ""}`
                  : "Sin cliente"}
              </small>
            </div>
          </article>
        ))}
      </div>

      <Link className="agent-dashboard__subtle-button" href="/schedule">
        Ver agenda completa <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

function ReportsCard({ reportes }) {
  return (
    <section
      className="agent-dashboard__card agent-dashboard__reports-card"
      aria-labelledby="agent-reports-title"
    >
      <header className="agent-dashboard__section-heading">
        <Icon src={toolboxIcon} />
        <h2 id="agent-reports-title">Reportes de inquilinos</h2>
        <span className="agent-dashboard__pending">
          {reportes.total} {reportes.total === 1 ? "pendiente" : "pendientes"}
        </span>
        <span className="agent-dashboard__heading-chevron" aria-hidden="true">
          ›
        </span>
      </header>

      <div className="agent-dashboard__reports-list">
        {reportes.items.length === 0 && (
          <p className="dashboard-activity-empty">No hay reportes sin revisar.</p>
        )}
        {reportes.items.map((reporte) => (
          <Link className="agent-dashboard__report-item" href="/reports-agent" key={reporte.id}>
            <img src={imagen("reportes", reporte.imagen)} alt="" />
            <span className="agent-dashboard__report-copy">
              <strong>
                {reporte.titulo}
                {PRIORIDADES_ALTAS.includes(reporte.prioridad) && (
                  <i aria-label={`Prioridad ${reporte.prioridad.toLowerCase()}`} />
                )}
              </strong>
              <span>{reporte.personaReporta}</span>
              <span>{reporte.propiedad}</span>
            </span>
            <small>{hace(reporte.fecha)}</small>
            <b aria-hidden="true">›</b>
          </Link>
        ))}
      </div>

      <Link className="agent-dashboard__reports-button" href="/reports-agent">
        Todos los reportes <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function AgentDashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const nombre = api.getSession()?.usuario?.nombre;

  useEffect(() => {
    let vigente = true;
    api
      .dashboard()
      .then((respuesta) => {
        if (vigente) setDatos(respuesta);
      })
      .catch((causa) => {
        if (!vigente) return;
        setError(true);
        mostrarToast({
          tipo: "error",
          titulo: causa.codigo,
          mensaje: causa.mensaje ?? causa.message,
          accion: { texto: "Recargar", onclick: () => window.location.reload() },
        });
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (error || !datos) return null;

  return (
    <main id="agent-dashboard">
      <div className="agent-dashboard__page">
        <header className="agent-dashboard__intro">
          <div>
            <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
            <p>Aquí tienes un resumen de la actividad de la inmobiliaria</p>
          </div>
          <Link className="agent-dashboard__schedule-button" href="/schedule">
            <Icon src={plusIconWhite} />
            Agendar cita
          </Link>
        </header>

        <div className="agent-dashboard__grid">
          <AgendaCard fecha={datos.fecha} agenda={datos.agenda} />
          <SharedPerformanceCard
            className="agent-dashboard__performance-card"
            indicadores={datos.indicadores}
            grafico={datos.rendimiento}
          />
          <ReportsCard reportes={datos.reportesSinRevisar} />
          <SharedActivityCard />
        </div>
      </div>
    </main>
  );
}
