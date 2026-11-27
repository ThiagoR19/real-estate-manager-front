import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import PageSkeleton from "../../components/skeleton/PageSkeleton";

import { TarjetaActividad, TarjetaRendimiento } from "../../components";
import initials from "../../utils/initials"
import avatar from "../../utils/avatarClass"
import { mostrarAviso } from "../../components"

import "./Dashboard.css";
import { hauseDashboardIcon, keyDashboardIcon, peopleIcon, penIcon, plusIconWhite, sellDashboardIcon } from "../../assets/icons";


function Icono({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function TarjetaAgentes({ agents }) {
  return (
    <section className="dashboard-card dashboard-agentes-card">
      <h2 className="dashboard-card__title"><Icono src={peopleIcon} />Top Agentes</h2>
      <div className="dashboard-agentes-list">
        {agents.map((agent) =>
          <div className="dashboard-agente" key={`AG${initials(agent.nombre, agent.apellido)}${agent.idAgente}`}>
            {agent.urlFotoPerfil
              ? <img className="dashboard-avatar dashboard-avatar--foto" src={api.urlRecurso(agent.urlFotoPerfil)} alt="" aria-hidden="true" />
              : <div className={`dashboard-avatar ${avatar(agent.nombre, agent.apellido)}`} aria-hidden="true">
                {initials(agent.nombre, agent.apellido)}
              </div>}

            <strong>{agent.nombre}</strong>
            <div className="dashboard-agente__stats">
              <span>• {agent.ventas} Ventas</span><span>• {agent.alquileres} Alq</span>
            </div>
          </div>)}
      </div>
      <Link className="dashboard-outline-button" href="/agentes">Ver todos los agentes <span aria-hidden="true">→</span></Link>
    </section>
  );
}

function TarjetaEstado({ valores }) {
  let statusItems = [
    { label: "Total de propiedades:", value: valores["total"], icon: hauseDashboardIcon },
    { label: "Total en alquiler:", value: valores.enAlquiler, icon: keyDashboardIcon },
    { label: "Propiedades vendidas:", value: valores.vendidas, icon: hauseDashboardIcon },
    { label: "Propiedades vacias:", value: valores.vacias, icon: sellDashboardIcon },
  ];
  return (
    <section className="dashboard-card dashboard-estado-card">
      <div className="dashboard-estado-card__heading">
        <h2 className="dashboard-card__title"><Icono src={penIcon} />Estados</h2>
        <Link href="/propiedades" aria-label="Ver propiedades"></Link>
      </div>
      <div className="dashboard-estado-list">
        {statusItems.map((item) =>
          <div className="dashboard-estado-item" key={item.label}>
            <strong>{item.label}</strong><b>{item.value}</b><Icono src={item.icon} className="dashboard-icon--original" />
          </div>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let activo = true;
    api.dashboard()
      .then((respuesta) => { if (activo) setDatos(respuesta); })
      .catch((causa) => {
        if (!activo) return;
        setError(causa.message)
        mostrarAviso({
          tipo: "error",
          titulo: "No se pudo cargar el panel",
          mensaje: causa.mensaje ?? causa.message,
          accion: { texto: "Recargar", onClick: () => window.location.reload() },
        });
      })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, []);
  if (error) return <main className="dashboard-page"><p role="alert">{error}</p></main>;
  if (loading) return <PageSkeleton variant="dashboard" title="administrador" />;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page__background" aria-hidden="true" />
      <header className="dashboard-hero">
        <div>
          <h1>¡Hola, Thiago!</h1>
          <p><span className="dashboard-hero__desktop-copy">Aquí tienes un resumen de la actividad de la inmobiliaria</span><span className="dashboard-hero__mobile-copy">Aquí tienes un resumen de tu inmobiliaria</span></p>
        </div>
        <Link className="dashboard-cita-button" href="/agenda">
          <img src={plusIconWhite} alt="" aria-hidden="true" />
          Agendar cita
        </Link>
      </header>
      <div className="dashboard-content">
        <TarjetaAgentes
          agents={datos.topAgentes}
        />
        <TarjetaRendimiento
          indicadores={datos.indicadores}
          grafico={datos.rendimiento}
        />
        <TarjetaEstado
          valores={datos.estadosPropiedades}
        />
        <TarjetaActividad className="dashboard-shared-activity" />
      </div>
    </main>
  );
}

