import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

import { ActivityCard as SharedActivityCard, PerformanceCard as SharedPerformanceCard } from "./DashboardWidgets";
import initials from "../../utils/initials"
import avatar from "../../utils/avatarClass"
import "./Dashboard.css";
import { houseIcon, peopleIcon, penIcon, plusIconWhite, tagIcon } from "../../assets/icons";
import keyIcon from "../../assets/icons/llaveNosotrosIcon.svg";


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
    { label: "Total de propiedades:", value: valores["total"], icon: houseIcon },
    { label: "Total en alquiler:", value: valores.enAlquiler, icon: keyIcon },
    { label: "Propiedades vendidas:", value: valores.vendidas, icon: houseIcon },
    { label: "Propiedades vacias:", value: valores.vacias, icon: tagIcon },
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
            <strong>{item.label}</strong><b>{item.value}</b><Icon src={item.icon} />
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
      .catch((causa) => setError(causa.message))
      .finally(() => setLoading(false));
  }, []);
  if (error) return <main className="dashboard-page"><p role="alert">{error}</p></main>;
  if (!loading) {
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

