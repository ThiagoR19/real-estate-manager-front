import { useEffect, useMemo, useRef, useState } from "react";
import {
  agiLogo,
  buildingColumnsIcon,
  magnifyingGlassIcon,
  paperPlaneIcon,
  userIcon,
} from "../../assets/icons";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import { mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { obtenerSesion } from "../../utils/sesion.js";
import { obtenerSocket } from "../../services/socket.js";
import "./Chat.css";

const RESPALDO_MS = 60000;

function sumarMensajes(actuales, nuevos) {
  const ids = new Set(nuevos.map((mensaje) => mensaje.id));
  return [...actuales.filter((mensaje) => !ids.has(mensaje.id)), ...nuevos];
}
const nombrePersona = (persona) =>
  [persona.nombre, persona.apellido].filter(Boolean).join(" ") || "Usuario";
const formatearHora = (date) =>
  date
    ? new Date(date).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

function ConversationAvatar({ kind, className = "" }) {
  const isAdministration = kind === "administration";
  return (
    <span
      className={`chat__avatar ${isAdministration ? "chat__avatar--agi" : "chat__avatar--agent"} ${className}`}
      aria-hidden="true"
    >
      <img src={isAdministration ? agiLogo : userIcon} alt="" />
    </span>
  );
}

export default function Chat() {
  const [conversaciones, setConversaciones] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [borrador, setBorrador] = useState("");
  const [idNuevoContacto, setIdNuevoContacto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const atBottomRef = useRef(true);
  const sesion = obtenerSesion();

  async function actualizarConversaciones() {
    const rows = await api.conversaciones();
    setConversaciones(rows);
    setIdSeleccionado((current) =>
      current === 0
        ? 0
        : current && rows.some((row) => row.id === current)
          ? current
          : rows[0]?.id ?? null
    );
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.conversaciones(), api.contactosChat()])
      .then(([rows, people]) => {
        if (!active) return;
        setConversaciones(rows);
        setContactos(people);
        setIdSeleccionado(rows[0]?.id ?? null);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({
          tipo: "error",
          titulo: "No se pudieron cargar las conversaciones",
          mensaje: cause.message,
        });
      })
      .finally(() => {
        if (active) setCargando(false);
      });
    function actualizarLista() {
      api.conversaciones()
        .then((rows) => {
          if (active) {
            setConversaciones(rows);
            setIdSeleccionado((current) =>
              current === 0
                ? 0
                : current && rows.some((row) => row.id === current)
                  ? current
                  : rows[0]?.id ?? null
            );
          }
        })
        .catch(() => { });
    }
    const socket = obtenerSocket();
    socket?.on("chat:actualizada", actualizarLista);
    socket?.io.on("reconnect", actualizarLista);
    const interval = window.setInterval(actualizarLista, RESPALDO_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      socket?.off("chat:actualizada", actualizarLista);
      socket?.io.off("reconnect", actualizarLista);
    };
  }, []);

  useEffect(() => {
    if (!idSeleccionado) return undefined;
    let active = true;
    let leidoHasta = null;
    const socket = obtenerSocket();

    const agregar = (nuevos) =>
      setMensajes((current) => sumarMensajes(current, nuevos));

    async function marcarLeido(ultimoId) {
      if (leidoHasta !== null && ultimoId <= leidoHasta) return;
      leidoHasta = ultimoId;
      await api.marcarChatLeido(idSeleccionado);
    }

    async function actualizarMensajes() {
      try {
        const result = await api.mensajesChat(idSeleccionado);
        if (!active) return;
        const recent = [...result.data].reverse();
        agregar(recent);
        await marcarLeido(Math.max(0, ...recent.map((mensaje) => mensaje.id)));
      } catch (cause) {
        if (active) setError(cause.message);
      }
    }

    function unirse() {
      socket?.emit("chat:unirse", { idConversacion: idSeleccionado });
    }

    function alConectar() {
      unirse();
      actualizarMensajes();
    }

    function alRecibir(mensaje) {
      if (!active || mensaje.idConversacion !== idSeleccionado) return;
      agregar([mensaje]);
      marcarLeido(mensaje.id).catch(() => { });
    }

    actualizarMensajes();
    unirse();
    socket?.on("connect", alConectar);
    socket?.on("chat:mensaje", alRecibir);
    const interval = window.setInterval(actualizarMensajes, RESPALDO_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      socket?.off("connect", alConectar);
      socket?.off("chat:mensaje", alRecibir);
      socket?.emit("chat:salir", { idConversacion: idSeleccionado });
    };
  }, [idSeleccionado]);

  useEffect(() => {
    if (atBottomRef.current) endRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, idSeleccionado]);

  const conversacionSeleccionada = conversaciones.find(({ id }) => id === idSeleccionado);
  const conversacionesFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLocaleLowerCase("es-AR");
    return conversaciones.filter((item) =>
      nombrePersona(item).toLocaleLowerCase("es-AR").includes(textoBusqueda)
    );
  }, [conversaciones, busqueda]);
  const opcionesConversaciones = conversaciones.map(
    (item) => `${nombrePersona(item)} (#${item.id})`
  );
  const kind = conversacionSeleccionada?.rol?.toLowerCase().includes("admin")
    ? "administration"
    : "agent";

  async function enviarMensaje(event) {
    event.preventDefault();
    const contenido = borrador.trim();
    if (!contenido || enviando) return;
    setEnviando(true);
    atBottomRef.current = true;
    setError("");
    try {
      if (idSeleccionado) {
        const mensaje = await api.enviarMensajeChat(idSeleccionado, contenido);
        setMensajes((current) => sumarMensajes(current, [mensaje]));
      } else {
        if (!idNuevoContacto || !contenido)
          throw new Error("Seleccioná un contacto y escribí un mensaje.");
        const result = await api.iniciarConversacion(Number(idNuevoContacto), contenido);
        await actualizarConversaciones();
        setMensajes([]);
        setIdSeleccionado(result.conversacion.id);
        setIdNuevoContacto("");
      }
      setBorrador("");
      await actualizarConversaciones();
    } catch (cause) {
      mostrarAviso({
        tipo: "error",
        titulo: "No se pudo enviar el mensaje",
        mensaje: cause.message,
      });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <PageSkeleton variant="chat" />;

  return (
    <main id="chat" className="chat-page">
      {conversaciones.length > 0 && (
        <SelectDesplegable
          label="Conversación"
          value={
            conversacionSeleccionada
              ? `${nombrePersona(conversacionSeleccionada)} (#${idSeleccionado})`
              : ""
          }
          options={opcionesConversaciones}
          onChange={(nombre) => {
            atBottomRef.current = true;
            setMensajes([]);
            setIdSeleccionado(Number(nombre.match(/#(\d+)\)$/)?.[1]));
          }}
          className="chat__mobile-select"
          triggerClassName="chat__mobile-select-trigger"
          chevronClassName="chat__mobile-select-chevron"
          blurOnSelect
        />
      )}
      <button
        className="chat__mobile-new"
        type="button"
        onClick={() => {
          atBottomRef.current = true;
          setIdSeleccionado(0);
          setMensajes([]);
          setBorrador("");
        }}
      >
        + Nueva conversación
      </button>
      <div className="chat__layout">
        <aside className="chat__conversations" aria-label="Conversaciones">
          <div className="chat__sidebar-heading">
            <h1>Conversaciones</h1>
            <span className="chat__total">{conversaciones.length}</span>
          </div>
          <label className="chat__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar conversación"
              aria-label="Buscar conversación"
            />
          </label>
          <button
            className="chat__new"
            type="button"
            onClick={() => {
              atBottomRef.current = true;
              setIdSeleccionado(0);
              setMensajes([]);
              setBorrador("");
            }}
          >
            + Nueva conversación
          </button>
          <div className="chat__conversation-list" role="list">
            {conversacionesFiltradas.map((conversation) => (
              <button
                className={`chat__conversation${conversation.id === idSeleccionado ? " is-selected" : ""}`}
                key={conversation.id}
                type="button"
                onClick={() => {
                  atBottomRef.current = true;
                  setIdSeleccionado(conversation.id);
                  setMensajes([]);
                  setBorrador("");
                }}
                aria-current={
                  conversation.id === idSeleccionado ? "page" : undefined
                }
              >
                <ConversationAvatar kind={conversation.rol?.toLowerCase().includes("admin") ? "administration" : "agent"} />
                <span className="chat__conversation-copy">
                  <span className="chat__conversation-name">
                    {nombrePersona(conversation)}{" "}
                    {conversation.noLeidos > 0 && (
                      <strong>({conversation.noLeidos})</strong>
                    )}
                  </span>
                  <span className="chat__conversation-preview">
                    {conversation.ultimoMensaje || "Todavía no hay mensajes"}
                  </span>
                </span>
              </button>
            ))}
            {!conversacionesFiltradas.length && (
              <p className="chat__empty-list">
                No hay conversaciones para mostrar.
              </p>
            )}
          </div>
          <div className="chat__sidebar-note">
            <img src={buildingColumnsIcon} alt="" />
            <span>Tu equipo, siempre cerca.</span>
          </div>
        </aside>
        <section className="chat__thread" aria-labelledby="chat-thread-title">
          <header className="chat__thread-header">
            <ConversationAvatar kind={kind} className="chat__avatar--header" />
            <div className="chat__thread-identity">
              <h2 id="chat-thread-title"> {conversacionSeleccionada ? nombrePersona(conversacionSeleccionada) : "Nueva conversación"} </h2>
              <p>{conversacionSeleccionada?.rol || "Elegí un contacto para comenzar"}</p>
            </div>
          </header>
          {error && (<p className="chat__error" role="alert">{error} </p>)}
          {!idSeleccionado && (
            <label className="chat__contact-picker">
              Contacto{" "}
              <select value={idNuevoContacto} onChange={(event) => setIdNuevoContacto(event.target.value)}>
                <option value="">Seleccioná un contacto</option>
                {contactos.map((contact) => (
                  <option value={contact.idUsuario} key={contact.idUsuario}>
                    {nombrePersona(contact)} · {contact.rol}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div
            className="chat__messages"
            aria-live="polite"
            aria-label={
              conversacionSeleccionada ? `Mensajes con ${nombrePersona(conversacionSeleccionada)}` : "Nueva conversación"
            }
            onScroll={(event) => {
              const node = event.currentTarget;
              atBottomRef.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 80;
            }}
          >
            {idSeleccionado && !mensajes.length && (
              <p className="chat__empty-thread">
                Todavía no hay mensajes en esta conversación.
              </p>
            )}
            {mensajes.map((mensaje) => {
              const side = mensaje.idUsuario === sesion?.usuario?.id ? "outgoing" : "incoming";
              return (
                <div
                  className={`chat__message chat__message--${side}`}
                  key={mensaje.id}
                >
                  {side === "incoming" && (
                    <ConversationAvatar
                      kind={kind}
                      className="chat__avatar--message"
                    />
                  )}
                  <div className="chat__message-content">
                    <div className={`chat__bubble chat__bubble--${side}`}>
                      <span>{mensaje.contenido}</span>
                    </div>
                    <time className="chat__message-time" dateTime={mensaje.fecha}>
                      {formatearHora(mensaje.fecha)}
                    </time>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form className="chat__composer" onSubmit={enviarMensaje}>
            <input
              value={borrador}
              onChange={(event) => setBorrador(event.target.value)}
              placeholder="Escribe tu mensaje..."
              aria-label="Escribe tu mensaje"
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={enviando || !borrador.trim()}
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <img src={paperPlaneIcon} alt="" />
            </button>
          </form>
          <p className="chat__composer-hint">Presiona Enter para enviar</p>
        </section>
      </div>
    </main>
  );
}
