import { useState } from "react";
import { checkIcon, fileLinesIcon, magnifyingGlassIcon, paperPlaneIcon, xIcon } from "../../assets/icons";
import Button from "../../components/button/Button";
import "./PaymentsAndCollections.css";

const people = [
  { name: "Maria Shakira", type: "Inquilino", property: "Propiedad baldez B2", amount: "14933.10", status: "Pendiente" },
  { name: "Sofia Ramirez", type: "Inquilino", property: "Casa de San Isidro", amount: "600.000,10", status: "Pendiente" },
  { name: "Juan Pérez", type: "Propietario", property: "Bielke 454", amount: "550.000,10", status: "Aprobado" },
];

const initialConcepts = [
  { label: "Electricidad", amount: "14933.10", tone: "muted" },
  { label: "Agua", amount: "14933.10", tone: "muted" },
  { label: "Expensas", amount: "49103", tone: "green" },
  { label: "Otros", amount: "49103", tone: "green" },
  { label: "Reparación", amount: "192.912,21", tone: "blue" },
];

function Icon({ src }) {
  return <img className="agent-payments__icon" src={src} alt="" aria-hidden="true" />;
}

function StatusButton({ type, children, onClick }) {
  return <button className={`agent-payments__decision agent-payments__decision--${type}`} type="button" onClick={onClick}><Icon src={type === "approved" ? checkIcon : xIcon} />{children}</button>;
}

export default function PaymentsAndCollections() {
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [decision, setDecision] = useState("");
  const [concepts, setConcepts] = useState(initialConcepts.map((concept) => ({ ...concept, checked: concept.tone !== "muted" })));
  const [feedback, setFeedback] = useState("");

  const visiblePeople = people.filter((person) => person.name.toLowerCase().includes(query.trim().toLowerCase()));
  const total = concepts.reduce((sum, concept) => sum + (concept.checked ? Number(concept.amount.replaceAll(".", "").replace(",", ".")) || 0 : 0), 0);

  function choosePerson(person) {
    setSelectedPerson(person);
    setDecision("");
    setFeedback("");
  }

  function toggleConcept(label) {
    setConcepts((current) => current.map((concept) => concept.label === label ? { ...concept, checked: !concept.checked } : concept));
  }

  function decide(value) {
    setDecision(value);
    setFeedback(value === "approved" ? "El pago fue marcado como aprobado." : "El pago fue rechazado y se notificará al inquilino.");
  }

  return (
    <main id="agent-payments">
      <header className="agent-payments__hero">
        <h1>Pagos y cobros</h1>
        <p>Estos pagos/cobros podrán ser visto desde la sección pagos de los propietarios o locatarios.</p>
      </header>

      <div className="agent-payments__layout">
        <aside className="agent-payments__people" aria-label="Personas">
          <h2>Personas</h2>
          <label className="agent-payments__search"><Icon src={magnifyingGlassIcon} /><input type="search" placeholder="Buscar persona..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar persona" /></label>
          <h3>Locatarios <span>‹</span></h3>
          {visiblePeople.filter((person) => person.type === "Inquilino").map((person) => <button className={`agent-payments__person${selectedPerson.name === person.name ? " is-selected" : ""}`} type="button" key={person.name} onClick={() => choosePerson(person)}><span className="agent-payments__avatar">{person.name.split(" ").map((word) => word[0]).join("")}</span><span><strong>{person.name}</strong><small>{person.property}</small></span><b>{person.status}</b></button>)}
          <h3>Propietarios <span>‹</span></h3>
          {visiblePeople.filter((person) => person.type === "Propietario").map((person) => <button className={`agent-payments__person${selectedPerson.name === person.name ? " is-selected" : ""}`} type="button" key={person.name} onClick={() => choosePerson(person)}><span className="agent-payments__avatar">JP</span><span><strong>{person.name}</strong><small>{person.property}</small></span><b>{person.status}</b></button>)}
        </aside>

        <section className="agent-payments__workspace">
          <header className="agent-payments__record-header">
            <label className="agent-payments__month"><span className="sr-only">Mes</span><select defaultValue="Noviembre"><option>Noviembre</option><option>Octubre</option><option>Septiembre</option></select></label>
            <h2>{selectedPerson.name}</h2><span className="agent-payments__rent">Alquiler</span><output>{selectedPerson.amount}</output>
            <StatusButton type="rejected" onClick={() => decide("rejected")}>Marcar como no pagado</StatusButton>
            <StatusButton type="approved" onClick={() => decide("approved")}>Marcar como pagado</StatusButton>
          </header>

          <div className="agent-payments__record-grid">
            <article className="agent-payments__property-card">
              <div className="agent-payments__property-copy"><h3>{selectedPerson.property}</h3><p>Estado: {decision === "approved" ? "pagado" : "sin enviar"}</p><p>Actualización del alquiler: 20/10/26</p><p>Servicios incluidos: No</p></div>
              <div className="agent-payments__concepts" aria-label="Conceptos del cobro">
                {concepts.map((concept) => <label className={`agent-payments__concept agent-payments__concept--${concept.tone}`} key={concept.label}><input type="checkbox" checked={concept.checked} onChange={() => toggleConcept(concept.label)} /><span>{concept.label}</span><input className="agent-payments__amount" value={concept.amount} readOnly aria-label={`Monto de ${concept.label}`} /><i>!</i></label>)}
              </div>
              <div className="agent-payments__concept-actions"><Button text="＋ Nuevo concepto" onClick={() => setFeedback("Podés agregar un concepto temporal desde esta acción.")} /><Button text="＋ Concepto temporal" onClick={() => setFeedback("Concepto temporal listo para editar.")} /></div>
            </article>

            <aside className="agent-payments__receipt"><div className="agent-payments__receipt-placeholder"><Icon src={fileLinesIcon} /><span>Comprobante del inquilino</span></div><div className="agent-payments__receipt-caption">{decision === "approved" ? "Pago aprobado" : "Comprobante pendiente de revisión"}</div></aside>
            <aside className="agent-payments__total"><h3>Detalle del cobro</h3>{concepts.filter((concept) => concept.checked).map((concept) => <div key={concept.label}><span>{concept.label}</span><b>${concept.amount}</b></div>)}<strong>Total: <b>${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</b></strong><button type="button" onClick={() => setFeedback("El pago fue enviado al propietario.")}><Icon src={paperPlaneIcon} />Enviar pago</button></aside>
          </div>
          <p className="agent-payments__feedback" role="status" aria-live="polite">{feedback}</p>
        </section>
      </div>
    </main>
  );
}
