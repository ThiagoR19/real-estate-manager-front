import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { circleInfoIcon, commentsIcon, paperPlaneIcon, smailing, toolplumbing } from "../../assets/icons";
import { mostrarAviso } from "../../components";
import { api } from "../../services/api";
import { estadoReporte } from "../../utils/estadoReporte.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import "./DashboardPropietario.css";

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

function ConversacionRapida({ chat }) {
  const idUsuario = api.obtenerSesion()?.usuario?.id;
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
      const mensaje = await api.enviarMensajeChat(conversacion.id, text);
      setMessages((currentMessages) => [...currentMessages, mensaje]);
      setDraft("");
    } catch (causa) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo enviar", mensaje: causa.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section
      className="dashboard-propietario__card dashboard-propietario__chat-card"
      aria-labelledby="quick-chat-title"
    >
      <header className="dashboard-propietario__card-header">
        <img src={commentsIcon} alt="" />
        <div className="dashboard-propietario__chat-title">
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
        className="dashboard-propietario__messages"
        ref={messagesRef}
        aria-live="polite"
        aria-label="Mensajes recientes"
      >
        {!conversacion && (
          <p className="dashboard-propietario__empty">
            Todavía no tenés conversaciones. <Link href="/chat">Ir al chat</Link>
          </p>
        )}
        {conversacion && messages.length === 0 && (
          <p className="dashboard-propietario__empty">No hay mensajes en esta conversación.</p>
        )}
        {messages.map((message) => {
          const propio = message.idUsuario === idUsuario;
          return (
            <article
              className={`dashboard-propietario__message dashboard-propietario__message--${propio ? "sent" : "received"}`}
              key={message.id}
            >
              <strong>{propio ? "Tú" : `${message.nombre} ${message.apellido}`}</strong>
              {message.contenido && <p>{message.contenido}</p>}
              <time dateTime={message.fecha}>{horaMensaje(message.fecha)}</time>
            </article>
          );
        })}
      </div>

      <form className="dashboard-propietario__chat-form" onSubmit={sendMessage}>
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

function Metrica({ etiqueta, parte, total }) {
  const valor = porcentaje(parte, total);
  return (
    <div className="dashboard-propietario__metric">
      <span>
        {etiqueta}: {parte}/{total}
      </span>
      <div
        className={`dashboard-propietario__progress${valor === 0 ? " dashboard-propietario__progress--empty" : ""}`}
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

function EstadoPropiedad({ resumen }) {
  return (
    <section
      className="dashboard-propietario__card dashboard-propietario__status-card"
      aria-labelledby="propiedad-status-title"
    >
      <header className="dashboard-propietario__card-header dashboard-propietario__card-header--with-copy">
        <img src={circleInfoIcon} alt="" />
        <div>
          <h2 id="propiedad-status-title">Estado de las propiedades</h2>
          <p>Aquí podrás ver un poco de información de tus propiedades</p>
        </div>
      </header>

      <div className="dashboard-propietario__status-content">
        <h3>Resumen de propiedades</h3>
        <div className="dashboard-propietario__metric dashboard-propietario__metric--main">
          <strong>Propiedades: {resumen.total}</strong>
        </div>

        <Metrica etiqueta="Vendidas" parte={resumen.vendidas} total={resumen.total} />
        <Metrica etiqueta="En alquiler" parte={resumen.enAlquiler} total={resumen.total} />
        <Metrica etiqueta="Disponibles" parte={resumen.disponibles} total={resumen.total} />

        <h3 className="dashboard-propietario__propiedades-title">Mis propiedades</h3>
        {resumen.propiedades.length === 0 ? (
          <p className="dashboard-propietario__empty">Todavía no tenés propiedades cargadas.</p>
        ) : (
          <div className="dashboard-propietario__propiedades-list">
            {resumen.propiedades.map((propiedad) => {
              const estado = ESTADOS[propiedad.estadoComercial] ?? {
                texto: propiedad.estadoComercial,
                tono: "inactive",
              };
              return (
                <article className="dashboard-propietario__propiedad" key={propiedad.id}>
                  <h4 title={propiedad.ubicacion ?? undefined}>{propiedad.nombre}</h4>
                  <span
                    className={`dashboard-propietario__propiedad-status dashboard-propietario__propiedad-status--${estado.tono}`}
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

function AccesoReportes({ reportes }) {
  return (
    <section
      className="dashboard-propietario__card dashboard-propietario__reportes-card"
      aria-labelledby="propiedad-report-title"
    >
      <header className="dashboard-propietario__card-header">
        <img src={toolplumbing} alt="" />
        <h2 id="propiedad-report-title">Reporte de propiedades</h2>
        {reportes.total > 0 && <span className="dashboard-propietario__count">{reportes.total}</span>}
      </header>

      {reportes.items.length > 0 ? (
        <ul className="dashboard-propietario__reportes-list">
          {reportes.items.map((reporte) => (
            <li key={reporte.id}>
              <strong>{reporte.titulo}</strong>
              <span>{reporte.propiedad}</span>
              <small>
                {estadoReporte(reporte.estado)} · {diaYMes(reporte.fecha)}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <div className="dashboard-propietario__reportes-body">
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

      <Link className="dashboard-propietario__reportes-link" href="/reportes-agente">
        Ir a reportes
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export default function DashboardPropietario() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const nombre = api.obtenerSesion()?.usuario?.nombre;

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
  if (!datos) return <PageSkeleton variant="dashboard" title="propietario" />;

  return (
    <main className="dashboard-propietario">
      <div className="dashboard-propietario__background" aria-hidden="true" />
      <div className="dashboard-propietario__content">
        <header className="dashboard-propietario__welcome">
          <h1>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
          <p>Aquí tienes un resumen de tus propiedades</p>
        </header>

        <div className="dashboard-propietario__grid">
          <ConversacionRapida chat={datos.chat} />
          <EstadoPropiedad resumen={datos.propiedades} />
          <AccesoReportes reportes={datos.reportes} />
        </div>
      </div>
    </main>
  );
}
