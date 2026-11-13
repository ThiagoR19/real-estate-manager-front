import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { calendarIcon } from "../../assets/icons";
import "../../pages/dashboard/Dashboard.css";
import "../../pages/agentDashboard/AgentDashboard.css";

const VISITAS_POR_PAGINA = 6;

function visitTime(fecha) {
  const date = new Date(fecha);
  const hora = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const esHoy = date.toDateString() === new Date().toDateString();
  return esHoy ? `Hoy ${hora}` : `${date.getDate()}/${date.getMonth() + 1} ${hora}`;
}

function Icon({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

export default function ActivityCard({ className = "agent-dashboard__card agent-dashboard__activity-card" }) {
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
