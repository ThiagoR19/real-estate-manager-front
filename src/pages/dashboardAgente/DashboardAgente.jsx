import { assetUrl } from "../../utils/assetUrl.js";
import { obtenerSesion } from "../../utils/sesion.js";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { calendarIcon, plusIconWhite, toolboxIcon, userIcon } from "../../assets/icons";
import { TarjetaActividad, TarjetaRendimiento, mostrarAviso } from "../../components";
import { api } from "../../services/api";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import fotoPorDefecto from "/images (1).jpg";
import "./DashboardAgente.css";

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

function Icono({ src, className = "" }) {
  return <img className={className} src={src} alt="" aria-hidden="true" />;
}

function imagen(carpeta, nombre) {
  return nombre ? assetUrl(`/uploads/${carpeta}/${nombre}`) : fotoPorDefecto;
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

function TarjetaAgenda({ fecha, agenda }) {
  return (
    <section
      className="dashboard-agente__card dashboard-agente__agenda-card"
      aria-labelledby="agent-agenda-title"
    >
      <header className="dashboard-agente__section-heading">
        <Icono src={calendarIcon} />
        <h2 id="agent-agenda-title">Agenda del día</h2>
        <time dateTime={fecha}>{fechaLarga(fecha)}</time>
      </header>

      <div className="dashboard-agente__agenda-list">
        {agenda.length === 0 && (
          <p className="dashboard-actividad-empty">No tenés visitas agendadas para hoy.</p>
        )}
        {agenda.map((visita) => (
          <article className="dashboard-agente__agenda-item" key={visita.id}>
            <time dateTime={visita.fecha}>{hora(visita.fecha)}</time>
            <span className="dashboard-agente__agenda-line" aria-hidden="true" />
            <img
              className="dashboard-agente__agenda-photo"
              src={imagen("propiedades", visita.propiedadImagen)}
              alt=""
            />
            <div className="dashboard-agente__agenda-copy">
              <strong>{visita.propiedad}</strong>
              <span>{visita.propiedadUbicacion || "Sin ubicación"}</span>
              <small>
                <Icono src={userIcon} />
                {visita.clienteNombre
                  ? `${visita.clienteNombre} ${visita.clienteApellido ?? ""}`
                  : "Sin cliente"}
              </small>
            </div>
          </article>
        ))}
      </div>

      <Link className="dashboard-agente__subtle-button" href="/agenda">
        Ver agenda completa <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

function TarjetaReportes({ reportes }) {
  return (
    <section
      className="dashboard-agente__card dashboard-agente__reportes-card"
      aria-labelledby="agent-reportes-title"
    >
      <header className="dashboard-agente__section-heading">
        <Icono src={toolboxIcon} />
        <h2 id="agent-reportes-title">Reportes de inquilinos</h2>
        <span className="dashboard-agente__pending">
          {reportes.total} {reportes.total === 1 ? "pendiente" : "pendientes"}
        </span>
        <span className="dashboard-agente__heading-chevron" aria-hidden="true">
          ›
        </span>
      </header>

      <div className="dashboard-agente__reportes-list">
        {reportes.items.length === 0 && (
          <p className="dashboard-actividad-empty">No hay reportes sin revisar.</p>
        )}
        {reportes.items.map((reporte) => (
          <Link className="dashboard-agente__report-item" href="/reportes-agente" key={reporte.id}>
            <img src={imagen("reportes", reporte.imagen)} alt="" />
            <span className="dashboard-agente__report-copy">
              <strong>
                {reporte.titulo}
              </strong>
              <span>{reporte.personaReporta}</span>
              <span>{reporte.propiedad}</span>
            </span>
            <small>{hace(reporte.fecha)}</small>
            <b aria-hidden="true">›</b>
          </Link>
        ))}
      </div>

      <Link className="dashboard-agente__reportes-button" href="/reportes-agente">
        Todos los reportes <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardAgente() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const nombre = obtenerSesion()?.usuario?.nombre;

  useEffect(() => {
    let vigente = true;
    api
      .dashboard()
      .then((respuesta) => {
        if (!vigente) return;
        setDatos(respuesta);
        const proximasVisitas = (respuesta.agenda ?? []).filter((visita) => new Date(visita.fecha).getTime() > Date.now());
        if (proximasVisitas.length) {
          const cantidad = proximasVisitas.length;
          mostrarAviso({
            tipo: "recordatorio",
            titulo: cantidad === 1 ? "Te queda una visita hoy" : `Te quedan ${cantidad} visitas hoy`,
            mensaje: `La próxima visita es a las ${hora(proximasVisitas[0].fecha)}.`,
          });
        }
      })
      .catch((causa) => {
        if (!vigente) return;
        setError(true);
        mostrarAviso({
          tipo: "error",
          titulo: "No se pudo cargar el panel",
          mensaje: causa.mensaje ?? causa.message,
          accion: { texto: "Recargar", onClick: () => window.location.reload() },
        });
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (error) return null;
  if (!datos) return <PageSkeleton variant="dashboard" title="agente" />;

  return (
    <main id="dashboard-agente">
      <div className="dashboard-agente__page">
        <header className="dashboard-agente__intro">
          <div>
            <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
            <p>Aquí tienes un resumen de la actividad de la inmobiliaria</p>
          </div>
          <Link className="dashboard-agente__agenda-button" href="/agenda">
            <Icono src={plusIconWhite} />
            Agendar cita
          </Link>
        </header>

        <div className="dashboard-agente__grid">
          <TarjetaAgenda fecha={datos.fecha} agenda={datos.agenda} />
          <TarjetaRendimiento
            className="dashboard-agente__performance-card"
            indicadores={datos.indicadores}
            grafico={datos.rendimiento}
          />
          <TarjetaReportes reportes={datos.reportesSinRevisar} />
          <TarjetaActividad />
        </div>
      </div>
    </main>
  );
}
