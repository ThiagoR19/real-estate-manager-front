import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  bellIcon,
  calendarIcon,
  checkIcon,
  circleInfoIcon,
  commentsIcon,
  fileLinesIcon,
  penIcon,
  toolboxIcon,
  xIcon,
} from "../../assets/icons";
import { mostrarToast } from "../../components";
import { api } from "../../services/api";
import "./TenantDashboard.css";

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

function AgendaIcon({ icon }) {
  if (icon === "payment") {
    return (
      <span className="tenant-dashboard__card-icon" aria-hidden="true">
        <span />
      </span>
    );
  }

  return <img src={icon} alt="" />;
}

function AgendaCard({ avisos }) {
  return (
    <section
      className="tenant-dashboard__card tenant-dashboard__agenda"
      aria-labelledby="agenda-title"
    >
      <header className="tenant-dashboard__card-heading">
        <img src={bellIcon} alt="" />
        <h2 id="agenda-title">Avisos</h2>
        {avisos.total > 0 && <span className="tenant-dashboard__count">{avisos.total} sin leer</span>}
      </header>

      <div className="tenant-dashboard__timeline">
        {avisos.items.length === 0 && (
          <p className="tenant-dashboard__empty">No tenés avisos sin leer.</p>
        )}
        {avisos.items.map((aviso) => (
          <article className="tenant-dashboard__event" key={aviso.id}>
            <time dateTime={aviso.fechaCreacion}>{hora(aviso.fechaCreacion)}</time>
            <span className="tenant-dashboard__event-marker" aria-hidden="true" />
            <span className="tenant-dashboard__event-icon">
              <AgendaIcon icon={ICONOS_POR_TIPO[aviso.tipo] ?? bellIcon} />
            </span>
            <div className="tenant-dashboard__event-copy">
              <strong title={aviso.contenido}>{aviso.titulo}</strong>
              <small>{diaYMes(aviso.fechaCreacion)}</small>
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
      <span className="tenant-dashboard__payment-icon">
        <img src={item.icon} alt="" />
      </span>
      <strong>{item.label}</strong>
      <b>{item.value}</b>
    </div>
  );
}

function ContractDetail({ alquiler }) {
  if (!alquiler.fechaFin) {
    return (
      <>
        <h3>Contrato sin fecha de fin</h3>
        <div className="tenant-dashboard__contract-dates">
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
        className="tenant-dashboard__progress"
        role="progressbar"
        aria-label="Progreso del contrato"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={alquiler.porcentaje}
        style={{ "--progreso": `${alquiler.porcentaje}%` }}
      >
        <span>{alquiler.porcentaje}%</span>
      </div>
      <div className="tenant-dashboard__contract-dates">
        <span>Inicio: {fechaCorta(alquiler.fechaInicio)}</span>
        <span>Fin: {fechaCorta(alquiler.fechaFin)}</span>
      </div>
    </>
  );
}

function RentalStatusCard({ alquiler, pagos }) {
  const habilitados = pagos?.habilitados ?? 0;
  const resumenes = [
    { label: "Comprobantes enviados", value: pagos?.comprobantesEnviados, icon: fileLinesIcon, tone: "info" },
    { label: "Pagos aprobados", value: pagos?.aprobados, icon: checkIcon, tone: "success" },
    { label: "Pagos rechazados", value: pagos?.rechazados, icon: xIcon, tone: "danger" },
  ].map((item) => ({ ...item, value: `${item.value ?? 0}/${habilitados}` }));

  return (
    <section
      className="tenant-dashboard__card tenant-dashboard__status"
      aria-labelledby="status-title"
    >
      <header className="tenant-dashboard__card-heading tenant-dashboard__status-heading">
        <span className="tenant-dashboard__info-icon">
          <img src={circleInfoIcon} alt="" />
        </span>
        <div>
          <h2 id="status-title">Estado del inquilino</h2>
          <p>Aquí verá datos que le podrán servir para tener una estancia correcta y cómoda</p>
        </div>
      </header>

      {alquiler ? (
        <div className="tenant-dashboard__status-content">
          <p className="tenant-dashboard__rental-label">Mi alquiler</p>
          <p className="tenant-dashboard__property">
            {alquiler.propiedad}
            {alquiler.propiedadUbicacion && <span> · {alquiler.propiedadUbicacion}</span>}
          </p>
          <ContractDetail alquiler={alquiler} />

          <h4>Resumen de pagos</h4>
          <div className="tenant-dashboard__payments">
            {resumenes.map((item) => (
              <PaymentSummary item={item} key={item.label} />
            ))}
          </div>
        </div>
      ) : (
        <div className="tenant-dashboard__status-content">
          <p className="tenant-dashboard__rental-label">Mi alquiler</p>
          <p className="tenant-dashboard__empty">
            No tenés un contrato de alquiler vigente. Si creés que es un error, comunicate con la
            inmobiliaria.
          </p>
        </div>
      )}
    </section>
  );
}

function ReportsCard({ reportes }) {
  return (
    <section
      className="tenant-dashboard__card tenant-dashboard__reports"
      aria-labelledby="reports-title"
    >
      <header className="tenant-dashboard__card-heading">
        <img src={penIcon} alt="" />
        <h2 id="reports-title">Reportes</h2>
        {reportes.total > 0 && (
          <span className="tenant-dashboard__count">
            {reportes.total} {reportes.total === 1 ? "abierto" : "abiertos"}
          </span>
        )}
      </header>

      {reportes.items.length > 0 ? (
        <ul className="tenant-dashboard__reports-list">
          {reportes.items.map((reporte) => (
            <li key={reporte.id}>
              <strong>{reporte.titulo}</strong>
              <small>
                {reporte.estado} · {diaYMes(reporte.fecha)}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <div className="tenant-dashboard__reports-message">
          <p>
            ¿Tiene algún problema la propiedad?
            <br />
            Envíe un reporte del problema y nos
            <br />
            encargaremos de solucionarlo
          </p>
          <span className="tenant-dashboard__face" aria-hidden="true" />
        </div>
      )}

      <Link className="tenant-dashboard__reports-button" href="/reports">
        <span>Ir a reportes</span>
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function TenantDashboard() {
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
    <main id="tenant-dashboard">
      <div className="tenant-dashboard__page">
        <header className="tenant-dashboard__intro">
          <div>
            <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
            <p>Aquí tienes un resumen de la actividad del alquiler</p>
          </div>
        </header>

        <div className="tenant-dashboard__grid">
          <AgendaCard avisos={datos.notificaciones} />
          <RentalStatusCard alquiler={datos.alquiler} pagos={datos.pagos} />
          <ReportsCard reportes={datos.reportes} />
        </div>
      </div>
    </main>
  );
}
