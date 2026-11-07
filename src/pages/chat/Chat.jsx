import { useMemo, useState } from "react";
import { buildingColumnsIcon, magnifyingGlassIcon, paperPlaneIcon, userIcon } from "../../assets/icons";
import agiLogo from "../../assets/icons/agiLogo.svg";
import "./Chat.css";

const conversations = [
  {
    id: "administracion",
    name: "Administración AGI",
    detail: "Bielke 454 - Depto. 3B",
    kind: "administration",
    status: "En línea",
    dayLabel: "Hoy",
    messages: [
      { id: "a-1", side: "incoming", time: "09:12", text: "¡Buen día! Te escribimos por la visita al departamento de Bielke 454." },
      { id: "a-2", side: "outgoing", time: "09:18", text: "Hola, sí. ¿Sigue disponible para el jueves por la tarde?" },
      { id: "a-3", side: "incoming", time: "09:21", text: "Sí, tenemos disponibilidad a las 16:30. La propiedad tiene 2 ambientes, balcón y cochera." },
      { id: "a-4", side: "outgoing", time: "09:27", text: "Perfecto, me interesa. ¿Qué documentación necesito llevar?" },
      { id: "a-5", side: "incoming", time: "09:31", text: "Con tu DNI alcanza para la visita. Si te gusta, después te compartimos los requisitos para avanzar con la reserva." },
      { id: "a-6", side: "outgoing", time: "09:35", text: "¡Genial! Confirmo entonces para el jueves a las 16:30. Gracias 😊" },
    ],
  },
  {
    id: "pablo", name: "Agente Pablo", detail: "Equipo comercial · Palermo", kind: "agent", status: "En línea", dayLabel: "Ayer",
    messages: [
      { id: "p-1", side: "incoming", time: "Ayer", text: "Hola, ¿cómo estás? Te paso una opción que puede encajar con lo que buscás." },
      { id: "p-2", side: "incoming", time: "Ayer", text: "Es un 2 ambientes luminoso en Palermo, cerca del subte y con expensas bajas. ¿Querés que coordinemos una visita?" },
      { id: "p-3", side: "outgoing", time: "Ayer", text: "¡Hola Pablo! Sí, me interesa. ¿Podría ser el viernes después de las 17?" },
    ],
  },
  {
    id: "juan", name: "Agente Juan", detail: "Equipo comercial · Caballito", kind: "agent", status: "Visto recientemente", dayLabel: "Ayer",
    messages: [
      { id: "j-1", side: "incoming", time: "Ayer", text: "Te confirmo que recibimos la documentación para la propiedad de Av. Rivadavia." },
      { id: "j-2", side: "outgoing", time: "Ayer", text: "¡Muchas gracias! Quedo atento a cualquier novedad." },
      { id: "j-3", side: "incoming", time: "Ayer", text: "Ya la estamos revisando. Te aviso apenas tenga una respuesta." },
    ],
  },
  {
    id: "batracio", name: "Agente Batracio", detail: "Equipo comercial · Villa Crespo", kind: "agent", status: "En línea", dayLabel: "Martes",
    messages: [
      { id: "b-1", side: "incoming", time: "Mar", text: "¡Buenas! La propietaria confirmó que acepta mascotas 🐾" },
      { id: "b-2", side: "outgoing", time: "Mar", text: "¡Qué buena noticia! ¿Podemos ver el departamento esta semana?" },
      { id: "b-3", side: "incoming", time: "Mar", text: "Sí, tengo un lugar el miércoles a las 18. ¿Te sirve?" },
    ],
  },
  {
    id: "san-martin", name: "Agente San Martín", detail: "Equipo comercial · Belgrano", kind: "agent", status: "Visto recientemente", dayLabel: "Lunes",
    messages: [
      { id: "s-1", side: "incoming", time: "Lun", text: "Te comparto el plano y las medidas del living que me pediste." },
      { id: "s-2", side: "outgoing", time: "Lun", text: "¡Gracias! El espacio se ve muy bien. ¿Tiene orientación al frente?" },
      { id: "s-3", side: "incoming", time: "Lun", text: "Así es, da al frente y recibe luz natural durante toda la mañana." },
    ],
  },
];

function ConversationAvatar({ kind, className = "" }) {
  const isAdministration = kind === "administration";
  return (
    <span className={`chat__avatar ${isAdministration ? "chat__avatar--agi" : "chat__avatar--agent"} ${className}`} aria-hidden="true">
      <img src={isAdministration ? agiLogo : userIcon} alt="" />
    </span>
  );
}

function getLastMessage(conversation) {
  return conversation.messages.at(-1)?.text ?? "Todavía no hay mensajes";
}

export default function Chat() {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState({});

  const selectedConversation = conversations.find(({ id }) => id === selectedId) ?? conversations[0];
  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return conversations;
    return conversations.filter(({ name, detail }) => `${name} ${detail}`.toLocaleLowerCase().includes(normalizedSearch));
  }, [search]);

  const visibleMessages = [...selectedConversation.messages, ...(sentMessages[selectedConversation.id] ?? [])];

  function selectConversation(id) {
    setSelectedId(id);
    setDraft("");
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setSentMessages((current) => ({
      ...current,
      [selectedConversation.id]: [
        ...(current[selectedConversation.id] ?? []),
        { id: `${selectedConversation.id}-${Date.now()}`, side: "outgoing", time: "Ahora", text },
      ],
    }));
    setDraft("");
  }

  return (
    <main id="chat" className="chat-page">
      <label className="chat__mobile-select"><span className="sr-only">Conversación</span><select value={selectedId} onChange={(event) => selectConversation(event.target.value)}>{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.name}</option>)}</select></label>
      <div className="chat__layout">
        <aside className="chat__conversations" aria-label="Conversaciones">
          <div className="chat__sidebar-heading">
            <h1>Conversaciones</h1>
            <span className="chat__total">{conversations.length}</span>
          </div>
          <label className="chat__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversación" aria-label="Buscar conversación" />
          </label>

          <div className="chat__conversation-list" role="list">
            {filteredConversations.map((conversation) => (
              <button
                className={`chat__conversation${conversation.id === selectedId ? " is-selected" : ""}`}
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                aria-current={conversation.id === selectedId ? "page" : undefined}
              >
                <ConversationAvatar kind={conversation.kind} />
                <span className="chat__conversation-copy">
                  <span className="chat__conversation-name">{conversation.name}</span>
                  <span className="chat__conversation-preview">{getLastMessage(conversation)}</span>
                </span>
                <span className="chat__online-dot" aria-label={conversation.status} title={conversation.status} />
              </button>
            ))}
            {filteredConversations.length === 0 && <p className="chat__empty-list">No se encontraron conversaciones.</p>}
          </div>
          <div className="chat__sidebar-note"><img src={buildingColumnsIcon} alt="" /><span>Tu equipo, siempre cerca.</span></div>
        </aside>

        <section className="chat__thread" aria-labelledby="chat-thread-title">
          <header className="chat__thread-header">
            <ConversationAvatar kind={selectedConversation.kind} className="chat__avatar--header" />
            <div className="chat__thread-identity">
              <h2 id="chat-thread-title">{selectedConversation.name}</h2>
              <p>{selectedConversation.detail}</p>
            </div>
            <span className="chat__presence"><span className="chat__online-dot" />{selectedConversation.status}</span>
          </header>

          <div className="chat__messages" aria-live="polite" aria-label={`Mensajes con ${selectedConversation.name}`}>
            <div className="chat__day-divider"><span>{selectedConversation.dayLabel}</span></div>
            {visibleMessages.length === 0 ? (
              <p className="chat__empty-thread">Todavía no hay mensajes en esta conversación.</p>
            ) : (
              visibleMessages.map((message) => (
                <div className={`chat__message chat__message--${message.side}`} key={message.id}>
                  {message.side === "incoming" && <ConversationAvatar kind={selectedConversation.kind} className="chat__avatar--message" />}
                  <div className="chat__message-content">
                    <div className={`chat__bubble${message.side === "incoming" ? " chat__bubble--incoming" : " chat__bubble--outgoing"}`}>
                      <span>{message.text}</span>
                    </div>
                    <time className="chat__message-time">{message.time}</time>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="chat__composer" onSubmit={sendMessage}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje" />
            <button type="submit" aria-label="Enviar mensaje" title="Enviar mensaje"><img src={paperPlaneIcon} alt="" /></button>
          </form>
          <p className="chat__composer-hint">Presiona Enter para enviar</p>
        </section>
      </div>
    </main>
  );
}
