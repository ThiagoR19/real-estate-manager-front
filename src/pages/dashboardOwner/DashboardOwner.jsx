import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { circleInfoIcon, commentsIcon, paperPlaneIcon, smailing, toolplumbing } from "../../assets/icons";
import { mostrarToast } from "../../components";
import { api } from "../../services/api";
import "./DashboardOwner.css";

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const ESTADOS = {
  Alquilada: { texto: "Alquilada", tono: "rented" },
  Disponible: { texto: "Disponible", tono: "sale" },
  Reservada: { texto: "Reservada", tono: "reserved" },
  Vendida: { texto: "Vendida", tono: "sold" },
  Inactiva: { texto: "Inactiva", tono: "inactive" },
};

function diaLocal(fecha) {
  return new Date(fecha).toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
}

function horaMensaje(fecha) {
  const hora = new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  });
  if (diaLocal(fecha) === diaLocal(Date.now())) return hora;
  const dia = new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "numeric",
    timeZone: ZONA_HORARIA,
  });
  return `${dia} ${hora}`;
}

function diaYMes(fecha) {
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: ZONA_HORARIA,
  });
}

function precio(valor, moneda) {
  if (valor === null || valor === undefined) return null;
  return `${moneda === "USD" ? "US$" : "$"} ${valor.toLocaleString("es-AR")}`;
}

function porcentaje(parte, total) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

function QuickChat({ chat }) {
  const idUsuario = api.getSession()?.usuario?.id;
  const [messages, setMessages] = useState(() => [...(chat?.mensajes ?? [])].reverse());
  const [draft, setDraft] = useState("");
  const [enviando, setEnviando] = useState(false);
  const messagesRef = useRef(null);
  const conversacion = chat?.conversacion;
  const soloLectura = conversacion && !conversacion.idPersona;

  useEffect(() => {
    const messageList = messagesRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || enviando || !conversacion) return;

    setEnviando(true);
    try {
      const mensaje = await api.sendChatMessage(conversacion.id, text);
      setMessages((currentMessages) => [...currentMessages, mensaje]);
      setDraft("");
    } catch (causa) {
      mostrarToast({ tipo: "error", titulo: "No se pudo enviar", mensaje: causa.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section
      className="owner-dashboard__card owner-dashboard__chat-card"
      aria-labelledby="quick-chat-title"
    >
      <header className="owner-dashboard__card-header">
        <img src={commentsIcon} alt="" />
        <div className="owner-dashboard__chat-title">
          <h2 id="quick-chat-title">Chat rápido</h2>
          {conversacion && (
            <p>
              {conversacion.nombre} {conversacion.apellido}
              {conversacion.rol && <span> · {conversacion.rol}</span>}
            </p>
          )}
        </div>
      </header>

      <div
        className="owner-dashboard__messages"
        ref={messagesRef}
        aria-live="polite"
        aria-label="Mensajes recientes"
      >
        {!conversacion && (
          <p className="owner-dashboard__empty">
            Todavía no tenés conversaciones. <Link href="/chat">Ir al chat</Link>
          </p>
        )}
        {conversacion && messages.length === 0 && (
          <p className="owner-dashboard__empty">No hay mensajes en esta conversación.</p>
        )}
        {messages.map((message) => {
          const propio = message.idUsuario === idUsuario;
          return (
            <article
              className={`owner-dashboard__message owner-dashboard__message--${propio ? "sent" : "received"}`}
              key={message.id}
            >
              <strong>{propio ? "Tú" : `${message.nombre} ${message.apellido}`}</strong>
              {message.contenido && <p>{message.contenido}</p>}
              <time dateTime={message.fecha}>{horaMensaje(message.fecha)}</time>
            </article>
          );
        })}
      </div>

      <form className="owner-dashboard__chat-form" onSubmit={sendMessage}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={soloLectura ? "Conversación de solo lectura" : "Escribe un mensaje..."}
          aria-label="Escribe un mensaje"
          maxLength={5000}
          disabled={!conversacion || soloLectura || enviando}
        />
        <button
          type="submit"
          aria-label="Enviar mensaje"
          disabled={!conversacion || soloLectura || enviando || !draft.trim()}
        >
          <img src={paperPlaneIcon} alt="" />
        </button>
      </form>
    </section>
  );
}

function Metric({ etiqueta, parte, total }) {
  const valor = porcentaje(parte, total);
  return (
    <div className="owner-dashboard__metric">
      <span>
        {etiqueta}: {parte}/{total}
      </span>
      <div
        className={`owner-dashboard__progress${valor === 0 ? " owner-dashboard__progress--empty" : ""}`}
        role="progressbar"
        aria-label={`${etiqueta}: ${valor} por ciento`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={valor}
        style={{ "--progreso": `${valor}%` }}
      >
        <span>{valor}%</span>
      </div>
    </div>
  );
}

function detalleDePropiedad(propiedad) {
  if (propiedad.inquilinos.length) {
    const nombres = propiedad.inquilinos.map((inquilino) => `${inquilino.nombre} ${inquilino.apellido}`);
    return `${nombres.length === 1 ? "Inquilino" : "Inquilinos"}: ${nombres.join(", ")}`;
  }
  const monto = precio(propiedad.precio, propiedad.moneda);
  return monto ? `Precio: ${monto}` : propiedad.ubicacion || "Sin datos adicionales";
}

function PropertyStatus({ resumen }) {
  return (
    <section
      className="owner-dashboard__card owner-dashboard__status-card"
      aria-labelledby="property-status-title"
    >
      <header className="owner-dashboard__card-header owner-dashboard__card-header--with-copy">
        <img src={circleInfoIcon} alt="" />
        <div>
          <h2 id="property-status-title">Estado de las propiedades</h2>
          <p>Aquí podrás ver un poco de información de tus propiedades</p>
        </div>
      </header>

      <div className="owner-dashboard__status-content">
        <h3>Resumen de propiedades</h3>
        <div className="owner-dashboard__metric owner-dashboard__metric--main">
          <strong>Propiedades: {resumen.total}</strong>
        </div>

        <Metric etiqueta="Vendidas" parte={resumen.vendidas} total={resumen.total} />
        <Metric etiqueta="En alquiler" parte={resumen.enAlquiler} total={resumen.total} />
        <Metric etiqueta="Disponibles" parte={resumen.disponibles} total={resumen.total} />

        <h3 className="owner-dashboard__properties-title">Mis propiedades</h3>
        {resumen.propiedades.length === 0 ? (
          <p className="owner-dashboard__empty">Todavía no tenés propiedades cargadas.</p>
        ) : (
          <div className="owner-dashboard__properties-list">
            {resumen.propiedades.map((propiedad) => {
              const estado = ESTADOS[propiedad.estadoComercial] ?? {
                texto: propiedad.estadoComercial,
                tono: "inactive",
              };
              return (
                <article className="owner-dashboard__property" key={propiedad.id}>
                  <h4 title={propiedad.ubicacion ?? undefined}>{propiedad.nombre}</h4>
                  <span
                    className={`owner-dashboard__property-status owner-dashboard__property-status--${estado.tono}`}
                  >
                    {estado.texto}
                  </span>
                  <p>{detalleDePropiedad(propiedad)}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function ReportsPrompt({ reportes }) {
  return (
    <section
      className="owner-dashboard__card owner-dashboard__reports-card"
      aria-labelledby="property-report-title"
    >
      <header className="owner-dashboard__card-header">
        <img src={toolplumbing} alt="" />
        <h2 id="property-report-title">Reporte de propiedades</h2>
        {reportes.total > 0 && <span className="owner-dashboard__count">{reportes.total}</span>}
      </header>

      {reportes.items.length > 0 ? (
        <ul className="owner-dashboard__reports-list">
          {reportes.items.map((reporte) => (
            <li key={reporte.id}>
              <strong>{reporte.titulo}</strong>
              <span>{reporte.propiedad}</span>
              <small>
                {reporte.estado} · {diaYMes(reporte.fecha)}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <div className="owner-dashboard__reports-body">
          <p>
            ¿Tiene algún problema la propiedad?
            <br />
            Envíe un reporte del problema y nos
            <br />
            encargaremos de solucionarlo
          </p>
          <img src={smailing} alt="" />
        </div>
      )}

      <Link className="owner-dashboard__reports-link" href="/reports-agent">
        Ir a reportes
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardOwner() {
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
    <main className="owner-dashboard">
      <div className="owner-dashboard__background" aria-hidden="true" />
      <div className="owner-dashboard__content">
        <header className="owner-dashboard__welcome">
          <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
          <p>Aquí tienes un resumen de tus propiedades</p>
        </header>

        <div className="owner-dashboard__grid">
          <QuickChat chat={datos.chat} />
          <PropertyStatus resumen={datos.propiedades} />
          <ReportsPrompt reportes={datos.reportes} />
        </div>
      </div>
    </main>
  );
}
