import { obtenerSesion } from "../../utils/sesion.js";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { bellIcon, calendarIcon, checkIcon, circleInfoIcon, commentsIcon, fileLinesIcon, penIcon, toolboxIcon, xIcon } from "../../assets/icons";
import { mostrarAviso } from "../../components";
import { api } from "../../services/api";
import { estadoReporte } from "../../utils/estadoReporte.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import "./DashboardInquilino.css";

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const ICONOS_POR_TIPO = {
  Contrato: fileLinesIcon,
  Pago: "payment",
  Mantenimiento: toolboxIcon,
  Mensaje: commentsIcon,
  Visita: calendarIcon,
};

function hora(fecha) {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  });
}

function diaYMes(fecha) {
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: ZONA_HORARIA,
  });
}

function fechaCorta(fecha) {
  if (!fecha) return "-";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function meses(cantidad) {
  return `${cantidad} ${cantidad === 1 ? "mes" : "meses"}`;
}

function IconoAgenda({ icon }) {
  if (icon === "payment") {
    return (
      <span className="dashboard-inquilino__card-icon" aria-hidden="true">
        <span />
      </span>
    );
  }

  return <img src={icon} alt="" />;
}

function TarjetaAgenda({ avisos }) {
  return (
    <section
      className="dashboard-inquilino__card dashboard-inquilino__agenda"
      aria-labelledby="agenda-title"
    >
      <header className="dashboard-inquilino__card-heading">
        <img src={bellIcon} alt="" />
        <h2 id="agenda-title">Avisos</h2>
        {avisos.total > 0 && <span className="dashboard-inquilino__count">{avisos.total} sin leer</span>}
      </header>

      <div className="dashboard-inquilino__timeline">
        {avisos.items.length === 0 && (
          <p className="dashboard-inquilino__empty">No tenés avisos sin leer.</p>
        )}
        {avisos.items.map((aviso) => (
          <article className="dashboard-inquilino__event" key={aviso.id}>
            <time dateTime={aviso.fechaCreacion}>{hora(aviso.fechaCreacion)}</time>
            <span className="dashboard-inquilino__event-marker" aria-hidden="true" />
            <span className="dashboard-inquilino__event-icon">
              <IconoAgenda icon={ICONOS_POR_TIPO[aviso.tipo] ?? bellIcon} />
            </span>
            <div className="dashboard-inquilino__event-copy">
              <strong title={aviso.contenido}>{aviso.titulo}</strong>
              <small>{diaYMes(aviso.fechaCreacion)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResumenPago({ item }) {
  return (
    <div className={`dashboard-inquilino__payment dashboard-inquilino__payment--${item.tone}`}>
      <span className="dashboard-inquilino__payment-icon">
        <img src={item.icon} alt="" />
      </span>
      <strong>{item.label}</strong>
      <b>{item.value}</b>
    </div>
  );
}

function DetalleContrato({ alquiler }) {
  if (!alquiler.fechaFin) {
    return (
      <>
        <h3>Contrato sin fecha de fin</h3>
        <div className="dashboard-inquilino__contract-dates">
          <span>Inicio: {fechaCorta(alquiler.fechaInicio)}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <h3>
        Contrato de {meses(alquiler.duracionMeses)}{" "}
        <span>(Restan {meses(alquiler.mesesRestantes)})</span>
      </h3>
      <div
        className="dashboard-inquilino__progress"
        role="progressbar"
        aria-label="Progreso del contrato"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={alquiler.porcentaje}
        style={{ "--progreso": `${alquiler.porcentaje}%` }}
      >
        <span>{alquiler.porcentaje}%</span>
      </div>
      <div className="dashboard-inquilino__contract-dates">
        <span>Inicio: {fechaCorta(alquiler.fechaInicio)}</span>
        <span>Fin: {fechaCorta(alquiler.fechaFin)}</span>
      </div>
    </>
  );
}

function TarjetaEstadoAlquiler({ alquiler, pagos }) {
  const habilitados = pagos?.habilitados ?? 0;
  const resumenes = [
    { label: "Comprobantes enviados", value: pagos?.comprobantesEnviados, icon: fileLinesIcon, tone: "info" },
    { label: "Pagos aprobados", value: pagos?.aprobados, icon: checkIcon, tone: "success" },
    { label: "Pagos rechazados", value: pagos?.rechazados, icon: xIcon, tone: "danger" },
  ].map((item) => ({ ...item, value: `${item.value ?? 0}/${habilitados}` }));

  return (
    <section
      className="dashboard-inquilino__card dashboard-inquilino__status"
      aria-labelledby="status-title"
    >
      <header className="dashboard-inquilino__card-heading dashboard-inquilino__status-heading">
        <span className="dashboard-inquilino__info-icon">
          <img src={circleInfoIcon} alt="" />
        </span>
        <div>
          <h2 id="status-title">Estado del inquilino</h2>
          <p>Aquí verá datos que le podrán servir para tener una estancia correcta y cómoda</p>
        </div>
      </header>

      {alquiler ? (
        <div className="dashboard-inquilino__status-content">
          <p className="dashboard-inquilino__rental-label">Mi alquiler</p>
          <p className="dashboard-inquilino__propiedad">
            {alquiler.propiedad}
            {alquiler.propiedadUbicacion && <span> · {alquiler.propiedadUbicacion}</span>}
          </p>
          <DetalleContrato alquiler={alquiler} />

          <h4>Resumen de pagos</h4>
          <div className="dashboard-inquilino__pagos">
            {resumenes.map((item) => (
              <ResumenPago item={item} key={item.label} />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-inquilino__status-content">
          <p className="dashboard-inquilino__rental-label">Mi alquiler</p>
          <p className="dashboard-inquilino__empty">
            No tenés un contrato de alquiler vigente. Si creés que es un error, comunicate con la
            inmobiliaria.
          </p>
        </div>
      )}
    </section>
  );
}

function TarjetaReportes({ reportes }) {
  return (
    <section
      className="dashboard-inquilino__card dashboard-inquilino__reportes"
      aria-labelledby="reportes-title"
    >
      <header className="dashboard-inquilino__card-heading">
        <img src={penIcon} alt="" />
        <h2 id="reportes-title">Reportes</h2>
        {reportes.total > 0 && (
          <span className="dashboard-inquilino__count">
            {reportes.total} {reportes.total === 1 ? "pendiente" : "pendientes"}
          </span>
        )}
      </header>

      {reportes.items.length > 0 ? (
        <ul className="dashboard-inquilino__reportes-list">
          {reportes.items.map((reporte) => (
            <li key={reporte.id}>
              <strong>{reporte.titulo}</strong>
              <small>
                {estadoReporte(reporte.estado)} · {diaYMes(reporte.fecha)}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <div className="dashboard-inquilino__reportes-message">
          <p>
            ¿Tiene algún problema la propiedad?
            <br />
            Envíe un reporte del problema y nos
            <br />
            encargaremos de solucionarlo
          </p>
          <span className="dashboard-inquilino__face" aria-hidden="true" />
        </div>
      )}

      <Link className="dashboard-inquilino__reportes-button" href="/reportes">
        <span>Ir a reportes</span>
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardInquilino() {
  const [datos, setDatos] = useState(null);
  const [avisos, setAvisos] = useState(null);
  const [error, setError] = useState(false);
  const nombre = obtenerSesion()?.usuario?.nombre;

  useEffect(() => {
    let vigente = true;
    const actualizarAvisos = (evento) => setAvisos(evento.detail);
    window.addEventListener("notificaciones-actualizadas", actualizarAvisos);
    api
      .dashboard()
      .then((respuesta) => {
        if (vigente) setDatos(respuesta);
      })
      .catch((error) => {
        if (!vigente) return;
        setError(true);
        mostrarAviso({
          tipo: "error",
          titulo: "No se pudo cargar el panel",
          mensaje: error.mensaje ?? error.message,
          accion: { texto: "Recargar", onClick: () => window.location.reload() },
        });
      });
    return () => {
      vigente = false;
      window.removeEventListener("notificaciones-actualizadas", actualizarAvisos);
    };
  }, []);

  if (error) return null;
  if (!datos) return <PageSkeleton variant="dashboard" title="inquilino" />;

  return (
    <main id="dashboard-inquilino">
      <div className="dashboard-inquilino__page">
        <header className="dashboard-inquilino__intro">
          <div>
            <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
            <p>Aquí tienes un resumen de la actividad del alquiler</p>
          </div>
        </header>

        <div className="dashboard-inquilino__grid">
          <TarjetaAgenda avisos={avisos ?? datos.notificaciones} />
          <TarjetaEstadoAlquiler alquiler={datos.alquiler} pagos={datos.pagos} />
          <TarjetaReportes reportes={datos.reportes} />
        </div>
      </div>
    </main>
  );
}
