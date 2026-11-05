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

function parseAmount(value) {
  const normalized = String(value).trim().replace(/[^\d,.-]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma !== -1 && dot !== -1) {
    const decimalMark = comma > dot ? "," : ".";
    const thousandsMark = decimalMark === "," ? /\./g : /,/g;
    return Number(normalized.replace(thousandsMark, "").replace(decimalMark, ".")) || 0;
  }
  if (comma !== -1) return Number(normalized.replace(/\./g, "").replace(",", ".")) || 0;
  if (dot !== -1 && normalized.length - dot - 1 === 3) return Number(normalized.replace(/\./g, "")) || 0;
  return Number(normalized) || 0;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function StatusButton({ type, children, onClick }) {
  return <button className={`agent-payments__decision agent-payments__decision--${type}`} type="button" onClick={onClick}><Icon src={type === "approved" ? checkIcon : xIcon} />{children}</button>;
}

export default function PaymentsAndCollections() {
  const [query, setQuery] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [decision, setDecision] = useState("");
  const [concepts, setConcepts] = useState(initialConcepts.map((concept, index) => ({ ...concept, id: `concept-${index}`, checked: concept.tone !== "muted" })));
  const [feedback, setFeedback] = useState("");

  const visiblePeople = people.filter((person) => person.name.toLowerCase().includes(query.trim().toLowerCase()));
  const total = concepts.reduce((sum, concept) => sum + (concept.checked ? parseAmount(concept.amount) : 0), 0);

  function choosePerson(person) {
    setSelectedPerson(person);
    setDecision("");
    setFeedback("");
  }

  function toggleConcept(id) {
    setConcepts((current) => current.map((concept) => concept.id === id ? { ...concept, checked: !concept.checked } : concept));
  }

  function decide(value) {
    setDecision(value);
    setFeedback(value === "approved" ? "El pago fue marcado como aprobado." : "El pago fue rechazado y se notificará al inquilino.");
  }

  function addConcept(temporary = false) {
    const label = window.prompt(temporary ? "Nombre del concepto temporal" : "Nombre del nuevo concepto");
    if (!label?.trim()) return;
    const amount = window.prompt(`Importe para ${label.trim()}`, "0,00");
    if (!amount?.trim() || parseAmount(amount) <= 0) return;
    setConcepts((current) => [...current, { id: `concept-${Date.now()}`, label: label.trim(), amount: amount.trim(), tone: temporary ? "blue" : "muted", checked: true }]);
    setFeedback(`${label.trim()} se agregó al detalle del cobro.`);
  }

  return (
    <main id="agent-payments">
      <header className="agent-payments__hero">
        <h1>Pagos y cobros</h1>
        <p>Estos pagos/cobros podrán ser visto desde la sección pagos de los propietarios o locatarios.</p>
      </header>

      <div className="agent-payments__layout">
        <aside className={`agent-payments__people${peopleOpen ? " is-open" : ""}`} aria-label="Personas">
          <button className="agent-payments__people-toggle" type="button" onClick={() => setPeopleOpen((open) => !open)} aria-expanded={peopleOpen} aria-label="Mostrar locatarios y propietarios"><span aria-hidden="true">›</span></button>
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
            <h2>{selectedPerson.name}</h2><span className="agent-payments__rent">Alquiler</span><output>{formatCurrency(parseAmount(selectedPerson.amount))}</output>
            <StatusButton type="rejected" onClick={() => decide("rejected")}>Marcar como no pagado</StatusButton>
            <StatusButton type="approved" onClick={() => decide("approved")}>Marcar como pagado</StatusButton>
          </header>

          <div className="agent-payments__record-grid">
            <article className="agent-payments__property-card">
              <div className="agent-payments__property-copy"><h3>{selectedPerson.property}</h3><p>Estado: {decision === "approved" ? "pagado" : decision === "rejected" ? "no pagado" : selectedPerson.status.toLowerCase()}</p><p>Actualización del alquiler: 20/10/26</p><p>Servicios incluidos: No</p></div>
              <div className="agent-payments__concepts" aria-label="Conceptos del cobro">
                {concepts.map((concept) => <label className={`agent-payments__concept agent-payments__concept--${concept.tone}`} key={concept.id}><input type="checkbox" checked={concept.checked} onChange={() => toggleConcept(concept.id)} /><span>{concept.label}</span><input className="agent-payments__amount" value={concept.amount} readOnly aria-label={`Monto de ${concept.label}`} /><i>!</i></label>)}
              </div>
              <div className="agent-payments__concept-actions"><Button text="＋ Nuevo concepto" onClick={() => addConcept(false)} /><Button text="＋ Concepto temporal" onClick={() => addConcept(true)} /></div>
            </article>

            <aside className="agent-payments__receipt"><div className="agent-payments__receipt-placeholder"><Icon src={fileLinesIcon} /><span>Comprobante del inquilino</span></div><div className="agent-payments__receipt-caption">{decision === "approved" ? "Pago aprobado" : decision === "rejected" ? "Pago rechazado" : "Comprobante pendiente de revisión"}</div></aside>
            <aside className="agent-payments__total"><h3>Detalle del cobro</h3>{concepts.filter((concept) => concept.checked).map((concept, index) => <div key={`${concept.label}-${index}`}><span>{concept.label}</span><b>{formatCurrency(parseAmount(concept.amount))}</b></div>)}<strong>Total: <b>{formatCurrency(total)}</b></strong><button type="button" onClick={() => setFeedback("El pago fue enviado al propietario.")}><Icon src={paperPlaneIcon} />Enviar pago</button></aside>
          </div>
          <p className="agent-payments__feedback" role="status" aria-live="polite">{feedback}</p>
        </section>
      </div>
    </main>
  );
}
