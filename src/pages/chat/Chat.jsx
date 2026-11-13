import { useEffect, useMemo, useRef, useState } from "react";
import { buildingColumnsIcon, magnifyingGlassIcon, paperPlaneIcon, userIcon } from "../../assets/icons";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import { api } from "../../services/api.js";
import { obtenerSesion } from "../../services/login.js";
import agiLogo from "../../assets/icons/agiLogo.svg";
import "./Chat.css";

const personName = (person) => [person.nombre, person.apellido].filter(Boolean).join(" ") || "Usuario";
const displayTime = (date) => date ? new Date(date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "";

function ConversationAvatar({ kind, className = "" }) {
  const isAdministration = kind === "administration";
  return (
    <span className={`chat__avatar ${isAdministration ? "chat__avatar--agi" : "chat__avatar--agent"} ${className}`} aria-hidden="true">
      <img src={isAdministration ? agiLogo : userIcon} alt="" />
    </span>
  );
}

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState([]);
  const [newContactId, setNewContactId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const endRef = useRef(null);
  const atBottomRef = useRef(true);
  const fileRef = useRef(null);
  const session = obtenerSesion();

  async function refreshConversations() {
    const rows = await api.conversaciones();
    setConversations(rows);
    setSelectedId((current) => current === 0 ? 0 : current && rows.some((row) => row.id === current) ? current : rows[0]?.id ?? null);
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.conversaciones(), api.contactosChat()])
      .then(([rows, people]) => {
        if (!active) return;
        setConversations(rows);
        setContacts(people);
        setSelectedId(rows[0]?.id ?? null);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    const interval = window.setInterval(() => {
      api.conversaciones().then((rows) => {
        if (active) {
          setConversations(rows);
          setSelectedId((current) => current === 0 ? 0 : current && rows.some((row) => row.id === current) ? current : rows[0]?.id ?? null);
        }
      }).catch(() => {});
    }, 10000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!selectedId) return undefined;
    let active = true;
    async function refresh() {
      try {
        const result = await api.mensajesChat(selectedId);
        if (!active) return;
        const recent = [...result.data].reverse();
        setMessages((current) => {
          const recentIds = new Set(recent.map((message) => message.id));
          return [...current.filter((message) => !recentIds.has(message.id)), ...recent];
        });
        setHasMore(page < (result.paginacion?.paginas || 1));
        await api.marcarChatLeido(selectedId);
      } catch (cause) { if (active) setError(cause.message); }
    }
    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [selectedId, page]);

  useEffect(() => { if (atBottomRef.current) endRef.current?.scrollIntoView({ block: "end" }); }, [messages, selectedId]);

  const selectedConversation = conversations.find(({ id }) => id === selectedId);
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-AR");
    return conversations.filter((item) => personName(item).toLocaleLowerCase("es-AR").includes(query));
  }, [conversations, search]);
  const conversationOptions = conversations.map((item) => `${personName(item)} (#${item.id})`);
  const kind = selectedConversation?.rol?.toLowerCase().includes("admin") ? "administration" : "agent";

  async function loadMore() {
    try {
      const next = page + 1;
      const result = await api.mensajesChat(selectedId, next);
      setMessages((current) => [...result.data.reverse(), ...current]);
      setPage(next);
      setHasMore(next < (result.paginacion?.paginas || 1));
    } catch (cause) { setError(cause.message); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if ((!content && !files.length) || sending) return;
    setSending(true);
    atBottomRef.current = true;
    setError("");
    try {
      if (selectedId) {
        const message = await api.enviarMensajeChat(selectedId, content, files);
        setMessages((current) => [...current, message]);
      } else {
        if (!newContactId || !content) throw new Error("Seleccioná un contacto y escribí un mensaje.");
        const result = await api.iniciarConversacion(Number(newContactId), content);
        await refreshConversations();
        setSelectedId(result.conversacion.id);
        setNewContactId("");
      }
      setDraft("");
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      await refreshConversations();
    } catch (cause) { setError(cause.message); }
    finally { setSending(false); }
  }

  return (
    <main id="chat" className="chat-page">
      {conversations.length > 0 && (
        <SelectDesplegable label="Conversación" value={selectedConversation ? `${personName(selectedConversation)} (#${selectedId})` : ""}
          options={conversationOptions} onChange={(name) => { atBottomRef.current = true; setMessages([]); setPage(1); setSelectedId(Number(name.match(/#(\d+)\)$/)?.[1])); }}
          className="chat__mobile-select" triggerClassName="chat__mobile-select-trigger" chevronClassName="chat__mobile-select-chevron" blurOnSelect />
      )}
      <button className="chat__mobile-new" type="button" onClick={() => { atBottomRef.current = true; setSelectedId(0); setMessages([]); setPage(1); setDraft(""); }}>+ Nueva conversación</button>
      <div className="chat__layout">
        <aside className="chat__conversations" aria-label="Conversaciones">
          <div className="chat__sidebar-heading"><h1>Conversaciones</h1><span className="chat__total">{conversations.length}</span></div>
          <label className="chat__search"><img src={magnifyingGlassIcon} alt="" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversación" aria-label="Buscar conversación" /></label>
          <button className="chat__new" type="button" onClick={() => { atBottomRef.current = true; setSelectedId(0); setMessages([]); setPage(1); setDraft(""); }}>+ Nueva conversación</button>
          <div className="chat__conversation-list" role="list">
            {filteredConversations.map((conversation) => (
              <button className={`chat__conversation${conversation.id === selectedId ? " is-selected" : ""}`} key={conversation.id} type="button" onClick={() => { atBottomRef.current = true; setSelectedId(conversation.id); setMessages([]); setPage(1); setDraft(""); }} aria-current={conversation.id === selectedId ? "page" : undefined}>
                <ConversationAvatar kind={conversation.rol?.toLowerCase().includes("admin") ? "administration" : "agent"} />
                <span className="chat__conversation-copy"><span className="chat__conversation-name">{personName(conversation)} {conversation.noLeidos > 0 && <strong>({conversation.noLeidos})</strong>}</span><span className="chat__conversation-preview">{conversation.ultimoMensaje || "Todavía no hay mensajes"}</span></span>
              </button>
            ))}
            {!loading && !filteredConversations.length && <p className="chat__empty-list">No hay conversaciones para mostrar.</p>}
          </div>
          <div className="chat__sidebar-note"><img src={buildingColumnsIcon} alt="" /><span>Tu equipo, siempre cerca.</span></div>
        </aside>
        <section className="chat__thread" aria-labelledby="chat-thread-title">
          <header className="chat__thread-header"><ConversationAvatar kind={kind} className="chat__avatar--header" /><div className="chat__thread-identity"><h2 id="chat-thread-title">{selectedConversation ? personName(selectedConversation) : "Nueva conversación"}</h2><p>{selectedConversation?.rol || "Elegí un contacto para comenzar"}</p></div></header>
          {error && <p className="chat__error" role="alert">{error}</p>}
          {!selectedId && <label className="chat__contact-picker">Contacto <select value={newContactId} onChange={(event) => setNewContactId(event.target.value)}><option value="">Seleccioná un contacto</option>{contacts.map((contact) => <option value={contact.idUsuario} key={contact.idUsuario}>{personName(contact)} · {contact.rol}</option>)}</select></label>}
          <div className="chat__messages" aria-live="polite" aria-label={selectedConversation ? `Mensajes con ${personName(selectedConversation)}` : "Nueva conversación"} onScroll={(event) => { const node = event.currentTarget; atBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80; }}>
            {selectedId && hasMore && <button type="button" className="chat__load-more" onClick={loadMore}>Ver mensajes anteriores</button>}
            {selectedId && !messages.length && <p className="chat__empty-thread">Todavía no hay mensajes en esta conversación.</p>}
            {messages.map((message) => {
              const side = message.idUsuario === session?.usuario?.id ? "outgoing" : "incoming";
              return <div className={`chat__message chat__message--${side}`} key={message.id}>{side === "incoming" && <ConversationAvatar kind={kind} className="chat__avatar--message" />}<div className="chat__message-content"><div className={`chat__bubble chat__bubble--${side}`}><span>{message.contenido}</span>{message.adjuntos?.map((attachment) => <button type="button" className="chat__attachment" key={attachment.id} onClick={() => api.descargarAdjuntoChat(selectedId, attachment).catch((cause) => setError(cause.message))}>📎 {attachment.nombreArchivo}</button>)}</div><time className="chat__message-time" dateTime={message.fecha}>{displayTime(message.fecha)}</time></div></div>;
            })}
            <div ref={endRef} />
          </div>
          <form className="chat__composer" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje" maxLength={5000} /><label className="chat__attach" title="Adjuntar archivos">📎<input ref={fileRef} className="chat__file-input" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setFiles([...event.target.files].slice(0, 5))} aria-label="Adjuntar archivos" disabled={!selectedId} /></label><button type="submit" disabled={sending} aria-label="Enviar mensaje" title="Enviar mensaje"><img src={paperPlaneIcon} alt="" /></button></form>
          {files.length > 0 && <p className="chat__composer-hint">{files.length} archivo(s) seleccionado(s)</p>}
          <p className="chat__composer-hint">Presiona Enter para enviar</p>
        </section>
      </div>
    </main>
  );
}
