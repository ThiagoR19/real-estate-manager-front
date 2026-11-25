import "./PageSkeleton.css";

function Bar({ width = "100%", height = 14, round = false }) {
  return (
    <span className={`page-skeleton__bar${round ? " page-skeleton__bar--round" : ""}`} style={{ width, height }} />
  );
}

function Intro({ title = true, action = false }) {
  return (
    <div className="page-skeleton__intro">
      <div>
        <Bar width={title ? 190 : 245} height={32} />
        <Bar width={310} />
      </div>
      {action && <Bar width={180} height={42} />}
    </div>
  );
}

function TableSkeleton({ title, columns, filters = 0 }) {
  return (
    <main
      id={title}
      className="page-skeleton page-skeleton--list"
      aria-busy="true"
      aria-label={`Cargando ${title}`}
      role="status"
    >
      <Intro />
      <div className="page-skeleton__summary">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="page-skeleton__summary-card" key={index}>
            <Bar width={42} height={42} round />
            <div>
              <Bar width={100} />
              <Bar width={50} height={22} />
            </div>
          </div>
        ))}
      </div>
      <div className="page-skeleton__toolbar">
        <Bar width={300} height={42} />
        {Array.from({ length: filters }, (_, index) => (
          <Bar width={150} height={42} key={index} />
        ))}
        <Bar width={170} height={42} />
      </div>
      <div className="page-skeleton__panel page-skeleton__table">
        <div
          className="page-skeleton__table-row page-skeleton__table-head"
          style={{ "--page-sk-columns": columns }}
        >
          {Array.from({ length: columns }, (_, index) => (
            <Bar width="70%" key={index} />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div
            className="page-skeleton__table-row"
            style={{ "--page-sk-columns": columns }}
            key={row}
          >
            {Array.from({ length: columns }, (_, column) => (
              <div className="page-skeleton__cell" key={column}>
                {column === 0 && <Bar width={38} height={38} round />}
                <div>
                  <Bar width={column === 0 ? 110 : "80%"} />
                  <Bar width={column === 0 ? 70 : "55%"} height={11} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

function PropertiesSkeleton() {
  return (
    <main
      id="propiedades"
      className="page-skeleton page-skeleton--list"
      aria-busy="true"
      aria-label="Cargando propiedades"
      role="status"
    >
      <Intro />
      <div className="page-skeleton__toolbar">
        {Array.from({ length: 3 }, (_, index) => (
          <Bar width={170} height={42} key={index} />
        ))}
        <Bar width={175} height={42} />
      </div>
      <div className="page-skeleton__property-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="page-skeleton__panel page-skeleton__property" key={index}>
            <Bar height={180} />
            <div className="page-skeleton__property-copy">
              <Bar width="75%" height={20} />
              <Bar width="60%" />
              <Bar width="90%" />
              <Bar width="40%" height={24} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function PropertySkeleton() {
  return (
    <main
      id="propiedad"
      className="page-skeleton page-skeleton--property"
      aria-busy="true"
      aria-label="Cargando propiedad"
      role="status"
    >
      <div className="propiedad__page" aria-hidden="true">
        <div className="propiedad__title-row">
          <Bar width="42%" height={32} />
          <Bar width={100} height={34} />
        </div>
        <div className="propiedad__layout">
          <div className="propiedad__left-column">
            <div className="propiedad__gallery">
              <div className="propiedad__gallery-main">
                <Bar height="100%" />
              </div>
              <div className="propiedad__gallery-thumbnails">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="propiedad__thumbnail" key={index}>
                    <Bar height="100%" />
                  </div>
                ))}
              </div>
            </div>
            <div className="propiedad__stats">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="propiedad__stat-card" key={index}>
                  <Bar width={45} height={45} />
                  <Bar width="35%" />
                  <Bar width={40} height={40} round />
                </div>
              ))}
            </div>
          </div>
          <div className="propiedad__right-column">
            <div className="propiedad__info-card">
              <Bar width={160} height={25} />
              <div className="page-skeleton__property-description">
                <Bar />
                <Bar width="85%" />
                <Bar width="65%" />
              </div>
              <div className="propiedad__details">
                {Array.from({ length: 7 }, (_, index) => (
                  <div className="propiedad__detail-row" key={index}>
                    <Bar width={21} height={21} />
                    <Bar width="80%" />
                    <Bar width="75%" />
                  </div>
                ))}
              </div>
            </div>
            <div className="propiedad__due-card">
              <Bar width="60%" height={20} />
              <div className="propiedad__due-grid">
                {Array.from({ length: 4 }, (_, index) => (
                  <Bar width="75%" height={30} key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function IndecSkeleton() {
  return (
    <main
      id="indec"
      className="page-skeleton page-skeleton--list"
      aria-busy="true"
      aria-label="Cargando porcentajes del INDEC"
      role="status"
    >
      <Intro action />
      <div className="page-skeleton__panel page-skeleton__indec">
        {Array.from({ length: 9 }, (_, index) => (
          <div className="page-skeleton__indec-row" key={index}>
            <Bar width={120} />
            <Bar width={75} />
          </div>
        ))}
      </div>
    </main>
  );
}

function DashboardSkeleton({ kind }) {
  const cardCount = kind === "inquilino" || kind === "propietario" ? 3 : 4;
  const id =
    kind === "agente"
      ? "dashboard-agente"
      : kind === "inquilino"
        ? "dashboard-inquilino"
        : undefined;
  const extraClass =
    kind === "administrador"
      ? " dashboard-page"
      : kind === "propietario"
        ? " dashboard-propietario"
        : "";

  return (
    <main
      id={id}
      className={`page-skeleton page-skeleton--dashboard page-skeleton--${kind}${extraClass}`}
      aria-busy="true"
      aria-label="Cargando dashboard"
      role="status"
    >
      <Intro action={kind === "administrador" || kind === "agente"} />
      <div className="page-skeleton__dashboard-grid">
        {Array.from({ length: cardCount }, (_, index) => (
          <div className="page-skeleton__panel page-skeleton__dashboard-card" key={index}>
            <Bar width="50%" height={22} />
            <div className="page-skeleton__dashboard-lines">
              {Array.from({ length: index === 1 ? 4 : 3 }, (_, row) => (
                <div className="page-skeleton__dashboard-line" key={row}>
                  <Bar
                    width={index === 1 ? 55 : 36}
                    height={index === 1 ? 55 : 36}
                    round={index !== 1}
                  />
                  <div>
                    <Bar width="75%" />
                    <Bar width="50%" height={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ChatSkeleton() {
  return (
    <main
      id="chat"
      className="chat-page page-skeleton page-skeleton--chat"
      aria-busy="true"
      aria-label="Cargando conversaciones"
      role="status"
    >
      <div className="page-skeleton__chat-layout">
        <div className="page-skeleton__panel page-skeleton__chat-sidebar">
          <Bar width={170} height={25} />
          <Bar height={37} />
          {Array.from({ length: 6 }, (_, index) => (
            <div className="page-skeleton__dashboard-line" key={index}>
              <Bar width={45} height={45} round />
              <div>
                <Bar width="70%" />
                <Bar width="90%" height={11} />
              </div>
            </div>
          ))}
        </div>
        <div className="page-skeleton__panel page-skeleton__chat-thread">
          <div className="page-skeleton__dashboard-line">
            <Bar width={44} height={44} round />
            <div>
              <Bar width={150} />
              <Bar width={90} height={11} />
            </div>
          </div>
          <div className="page-skeleton__chat-messages">
            <Bar width="48%" height={65} />
            <Bar width="35%" height={52} />
            <Bar width="55%" height={70} />
          </div>
          <Bar height={42} />
        </div>
      </div>
    </main>
  );
}

function AgendaSkeleton() {
  return (
    <main
      id="agenda"
      className="page-skeleton page-skeleton--agenda"
      aria-busy="true"
      aria-label="Cargando agenda"
      role="status"
    >
      <div className="page-skeleton__agenda-layout">
        <div className="page-skeleton__agenda-top">
          <Bar width="50%" height={80} />
          <Bar width={200} height={42} />
          <Bar width={200} height={42} />
        </div>
        <div className="page-skeleton__panel page-skeleton__calendar">
          <Bar width={220} height={28} />
          <div className="page-skeleton__calendar-grid">
            {Array.from({ length: 15 }, (_, index) => (
              <Bar height={70} key={index} />
            ))}
          </div>
        </div>
        <div className="page-skeleton__panel page-skeleton__upcoming">
          <Bar width="80%" height={24} />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <Bar width="80%" />
              <Bar width="60%" height={11} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SuperAdminSkeleton() {
  return (
    <main
      id="super-admin"
      className="page-skeleton page-skeleton--super-admin"
      aria-busy="true"
      aria-label="Cargando panel administrativo"
      role="status"
    >
      <aside className="page-skeleton__super-sidebar">
        <Bar width="80%" height={38} />
      </aside>
      <section className="page-skeleton__super-content">
        <Intro action />
        <div className="page-skeleton__summary">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="page-skeleton__summary-card" key={index}>
              <Bar width={42} height={42} round />
              <div>
                <Bar width={110} />
                <Bar width={45} height={22} />
              </div>
            </div>
          ))}
        </div>
        <div className="page-skeleton__panel page-skeleton__super-list">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="page-skeleton__dashboard-line" key={index}>
              <Bar width={54} height={54} round />
              <div>
                <Bar width="65%" height={20} />
                <Bar width="42%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function PageSkeleton({ variant, title }) {
  if (variant === "table") {
    return (
      <TableSkeleton
        title={title}
        columns={title === "agentes" ? 5 : 7}
        filters={title === "inquilinos" ? 3 : title === "agentes" ? 1 : 0}
      />
    );
  }
  if (variant === "properties") return <PropertiesSkeleton />;
  if (variant === "property") return <PropertySkeleton />;
  if (variant === "indec") return <IndecSkeleton />;
  if (variant === "dashboard") return <DashboardSkeleton kind={title} />;
  if (variant === "chat") return <ChatSkeleton />;
  if (variant === "agenda") return <AgendaSkeleton />;
  if (variant === "super-admin") return <SuperAdminSkeleton />;
  return null;
}
