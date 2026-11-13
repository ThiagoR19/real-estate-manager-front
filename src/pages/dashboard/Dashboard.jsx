import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

import { ActivityCard as SharedActivityCard, PerformanceCard as SharedPerformanceCard } from "../../components";
import initials from "../../utils/initials"
import avatar from "../../utils/avatarClass"
import { mostrarToast } from "../../components"

import "./Dashboard.css";
import { hauseDashboardIcon, keyDashboardIcon, peopleIcon, penIcon, plusIconWhite, sellDashboardIcon } from "../../assets/icons";


function Icon({ src, className = "" }) {
  return <img className={`dashboard-icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function AgentsCard({ agents }) {
  return (
    <section className="dashboard-card dashboard-agents-card">
      <h2 className="dashboard-card__title"><Icon src={peopleIcon} />Top Agentes</h2>
      <div className="dashboard-agents-list">
        {agents.map((agent) =>
          <div className="dashboard-agent" key={`AG${initials(agent.nombre, agent.apellido)}${agent.idAgente}`}>
            {agent.urlFotoPerfil
              ? <img className="dashboard-avatar dashboard-avatar--foto" src={api.assetUrl(agent.urlFotoPerfil)} alt="" aria-hidden="true" />
              : <div className={`dashboard-avatar ${avatar(agent.nombre, agent.apellido)}`} aria-hidden="true">
                {initials(agent.nombre, agent.apellido)}
              </div>}

            <strong>{agent.nombre}</strong>
            <div className="dashboard-agent__stats">
              <span>• {agent.ventas} Ventas</span><span>• {agent.alquileres} Alq</span>
            </div>
          </div>)}
      </div>
      <Link className="dashboard-outline-button" href="/agents">Ver todos los agentes <span aria-hidden="true">→</span></Link>
    </section>
  );
}

function StatusCard({ valores }) {
  let statusItems = [
    { label: "Total de propiedades:", value: valores["total"], icon: hauseDashboardIcon },
    { label: "Total en alquiler:", value: valores.enAlquiler, icon: keyDashboardIcon },
    { label: "Propiedades vendidas:", value: valores.vendidas, icon: hauseDashboardIcon },
    { label: "Propiedades vacias:", value: valores.vacias, icon: sellDashboardIcon },
  ];
  return (
    <section className="dashboard-card dashboard-status-card">
      <div className="dashboard-status-card__heading">
        <h2 className="dashboard-card__title"><Icon src={penIcon} />Estados</h2>
        <Link href="/properties" aria-label="Ver propiedades"></Link>
      </div>
      <div className="dashboard-status-list">
        {statusItems.map((item) =>
          <div className="dashboard-status-item" key={item.label}>
            <strong>{item.label}</strong><b>{item.value}</b><Icon src={item.icon} className="dashboard-icon--original" />
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
    api.dashboard()
      .then((respuesta) => setDatos(respuesta))
      .catch((causa) => {
        setError(causa.message)
        mostrarToast({ tipo: "error", titulo: causa.codigo, mensaje: causa.menssage, accion: { texto: "Recargar", onclick: () => window.location.reload } })
      })
      .finally(() => setLoading(false));
  }, []);
<<<<<<< HEAD
  if (error) return <main className="dashboard-page"><p role="alert">{error}</p></main>;
  if (!loading) {
=======

  if (!loading && error == "") {

>>>>>>> develop-nahuel
    return (
      <main className="dashboard-page">
        <div className="dashboard-page__background" aria-hidden="true" />
        <header className="dashboard-hero">
          <div>
            <h1>¡Hola, Thiago!</h1>
            <p><span className="dashboard-hero__desktop-copy">Aquí tienes un resumen de la actividad de la inmobiliaria</span><span className="dashboard-hero__mobile-copy">Aquí tienes un resumen de tu inmobiliaria</span></p>
          </div>
          <Link className="dashboard-appointment-button" href="/schedule">
            <img src={plusIconWhite} alt="" aria-hidden="true" />
            Agendar cita
          </Link>
        </header>
        <div className="dashboard-content">
          <AgentsCard
            agents={datos.topAgentes}
          />
          <SharedPerformanceCard
            indicadores={datos.indicadores}
            grafico={datos.rendimiento}
          />
          <StatusCard
            valores={datos.estadosPropiedades}
          />
          <SharedActivityCard className="dashboard-shared-activity" />
        </div>
      </main>
    );
  }
}

