import { useMemo, useState } from "react";
import { magnifyingGlassIcon, paperPlaneIcon } from "../../assets/icons";
import "./Chat.css";

const conversations = [
  {
    id: "administracion",
    name: "Administración AGI",
    detail: "Bielke 454 - Depto. 3B",
    messages: [
      { id: "a-1", side: "incoming", size: "large", time: "09:35", accessibleText: "Mensaje recibido" },
      { id: "a-2", side: "outgoing", size: "large", time: "09:35", accessibleText: "Mensaje enviado" },
      { id: "a-3", side: "incoming", size: "large", time: "09:35", accessibleText: "Mensaje recibido" },
      { id: "a-4", side: "outgoing", size: "medium", time: "09:35", accessibleText: "Mensaje enviado" },
      { id: "a-5", side: "incoming", size: "medium-large", time: "09:35", accessibleText: "Mensaje recibido" },
      { id: "a-6", side: "outgoing", size: "small", time: "09:35", accessibleText: "Mensaje enviado" },
    ],
  },
  { id: "pablo", name: "Agente Pablo", detail: "Equipo comercial", messages: [] },
  { id: "juan", name: "Agente Juan", detail: "Equipo comercial", messages: [] },
  { id: "batracio", name: "Agente Batracio", detail: "Equipo comercial", messages: [] },
  { id: "san-martin", name: "Agente San Martin", detail: "Equipo comercial", messages: [] },
];

function ConversationAvatar({ className = "" }) {
  return <span className={`chat__avatar ${className}`} aria-hidden="true" />;
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

  const visibleMessages = [
    ...selectedConversation.messages,
    ...(sentMessages[selectedConversation.id] ?? []),
  ];

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
        {
          id: `${selectedConversation.id}-${Date.now()}`,
          side: "outgoing",
          size: "text",
          time: "Ahora",
          text,
          accessibleText: `Mensaje enviado: ${text}`,
        },
      ],
    }));
    setDraft("");
  }

  return (
    <main id="chat" className="chat-page">
      <div className="chat__layout">
        <aside className="chat__conversations" aria-label="Conversaciones">
          <h1>Conversaciones</h1>
          <label className="chat__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conversación"
              aria-label="Buscar conversación"
            />
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
                <ConversationAvatar />
                <span>{conversation.name}</span>
              </button>
            ))}
            {filteredConversations.length === 0 && <p className="chat__empty-list">No se encontraron conversaciones.</p>}
          </div>
        </aside>

        <section className="chat__thread" aria-labelledby="chat-thread-title">
          <header className="chat__thread-header">
            <ConversationAvatar className="chat__avatar--header" />
            <div>
              <h2 id="chat-thread-title">{selectedConversation.name}</h2>
              <p>{selectedConversation.detail}</p>
            </div>
          </header>

          <div className="chat__messages" aria-live="polite">
            {visibleMessages.length === 0 ? (
              <p className="chat__empty-thread">Todavía no hay mensajes en esta conversación.</p>
            ) : (
              visibleMessages.map((message) => (
                <div className={`chat__message chat__message--${message.side}`} key={message.id}>
                  {message.side === "incoming" && <ConversationAvatar className="chat__avatar--message" />}
                  <div className={`chat__bubble chat__bubble--${message.size}`}>
                    {message.text && <span>{message.text}</span>}
                    <time>{message.time}</time>
                    <span className="visually-hidden">{message.accessibleText}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="chat__composer" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe tu mensaje"
              aria-label="Escribe tu mensaje"
            />
            <button type="submit" aria-label="Enviar mensaje" title="Enviar mensaje">
              <img src={paperPlaneIcon} alt="" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
