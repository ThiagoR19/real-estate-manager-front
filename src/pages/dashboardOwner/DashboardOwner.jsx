import { useState } from "react";
import { Link } from "wouter";
import { circleInfoIcon, commentsIcon, paperPlaneIcon, toolboxIcon } from "../../assets/icons";
import "./DashboardOwner.css";

const initialMessages = [
  { author: "Administracion", text: "Hola Juan, ¿pudiste revisar el presupuesto para la reparacion en Bulnes?", time: "10:15", type: "received" },
  { author: "Tu", text: "Si.", time: "10:15", type: "sent" },
  { author: "Administracion", text: "Uh flaco re cortante. Tratame mejor :) ", time: "10:15", type: "received" },
];

const properties = [
  { address: "Av. del Libertador 4500, 4B", status: "Alquilado", detail: "Inquilino: Thiago Hernandez", tone: "rented" },
  { address: "Bulnes 1200, 2A", status: "En venta", detail: "Precio: 204k", tone: "sale" },
];

function QuickChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { author: "Tu", text, time: "Ahora", type: "sent" },
    ]);
    setDraft("");
  }

  return (
    <section className="owner-dashboard__card owner-dashboard__chat-card" aria-labelledby="quick-chat-title">
      <header className="owner-dashboard__card-header">
        <img src={commentsIcon} alt="" />
        <h2 id="quick-chat-title">Chat rapido</h2>
      </header>

      <div className="owner-dashboard__messages" aria-live="polite">
        {messages.map((message, index) => (
          <article className={`owner-dashboard__message owner-dashboard__message--${message.type}`} key={`${message.time}-${index}`}>
            <strong>{message.author}</strong>
            <p>{message.text}</p>
            <time>{message.time}</time>
          </article>
        ))}
      </div>

      <form className="owner-dashboard__chat-form" onSubmit={sendMessage}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe un mensaje..."
          aria-label="Escribe un mensaje"
        />
        <button type="submit" aria-label="Enviar mensaje">
          <img src={paperPlaneIcon} alt="" />
        </button>
      </form>
    </section>
  );
}

function PropertyStatus() {
  return (
    <section className="owner-dashboard__card owner-dashboard__status-card" aria-labelledby="property-status-title">
      <header className="owner-dashboard__card-header owner-dashboard__card-header--with-copy">
        <img src={circleInfoIcon} alt="" />
        <div>
          <h2 id="property-status-title">Estado de las propiedades</h2>
          <p>Aqui podras ver un poco de informacion de tus propiedades</p>
        </div>
      </header>

      <div className="owner-dashboard__status-content">
        <h3>Resumen de propiedades</h3>
        <div className="owner-dashboard__metric owner-dashboard__metric--main">
          <strong>Propiedades: 2</strong>
        </div>

        <div className="owner-dashboard__metric">
          <span>Vendidas: 0/1</span>
          <div className="owner-dashboard__progress" aria-label="Vendidas: 0 por ciento">
            <span>0%</span>
          </div>
        </div>

        <div className="owner-dashboard__metric">
          <span>En alquiler: 1/1</span>
          <div className="owner-dashboard__progress owner-dashboard__progress--complete" aria-label="En alquiler: 100 por ciento">
            <span>100%</span>
          </div>
        </div>

        <h3 className="owner-dashboard__properties-title">Mis propiedades</h3>
        <div className="owner-dashboard__properties-list">
          {properties.map((property) => (
            <article className="owner-dashboard__property" key={property.address}>
              <h4>{property.address}</h4>
              <span className={`owner-dashboard__property-status owner-dashboard__property-status--${property.tone}`}>{property.status}</span>
              <p>{property.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsPrompt() {
  return (
    <section className="owner-dashboard__card owner-dashboard__reports-card" aria-labelledby="property-report-title">
      <header className="owner-dashboard__card-header">
        <img src={toolboxIcon} alt="" />
        <h2 id="property-report-title">Reporte de propiedades</h2>
      </header>
      <div className="owner-dashboard__reports-body">
        <p>¿Tiene algun problema la propiedad?<br />Envie un reporte del problema y no<br />encargaremos de solucionarlo</p>
        <span className="owner-dashboard__smile" aria-hidden="true" />
      </div>
      <Link className="owner-dashboard__reports-link" href="/reports">
        Ir a reportes
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardOwner() {
  return (
    <main className="owner-dashboard">
      <div className="owner-dashboard__background" aria-hidden="true" />
      <div className="owner-dashboard__content">
        <header className="owner-dashboard__welcome">
          <h1>¡Hola, Thiago!</h1>
          <p>Aqui tienes un resumen de la actividad del alquiler</p>
        </header>

        <div className="owner-dashboard__grid">
          <QuickChat />
          <PropertyStatus />
          <ReportsPrompt />
        </div>
      </div>
    </main>
  );
}
