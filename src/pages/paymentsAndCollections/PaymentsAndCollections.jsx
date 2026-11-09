import { useState } from "react";
import { checkIcon, circleInfoIcon, fileLinesIcon, imageIcon, magnifyingGlassIcon, paperPlaneIcon, plusIconWhite, xIcon } from "../../assets/icons";
import "./PaymentsAndCollections.css";

const people = [
  { name: "Maria Shakira", type: "Locatario", property: "Propiedad baldez B2", amount: "14933.10", status: "Sin enviar" },
  { name: "Sofia Ramirez", type: "Locatario", property: "Casa de San Isidro", amount: "600.000,10", status: "Pendiente" },
  { name: "Juan Pérez", type: "Propietario", property: "Bielke 454", amount: "550.000,10", status: "Aprobado" },
];

const initialConcepts = [
  { label: "Electricidad", amount: "14933.10", tone: "muted", checked: false },
  { label: "Agua", amount: "14933.10", tone: "muted", checked: false },
  { label: "Expensas", amount: "49103", tone: "green", checked: true },
  { label: "Otros", amount: "49103", tone: "green", checked: true },
  { label: "Reparación", amount: "192.912,21", tone: "blue", checked: true },
];

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function Icon({ src }) {
  return <img className="agent-payments__icon" src={src} alt="" aria-hidden="true" />;
}

function parseAmount(value) {
  const normalized = String(value).trim().replace(/[^\d,.-]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma !== -1 && dot !== -1) {
    const decimalMark = comma > dot ? "," : ".";
    return Number(normalized.replace(decimalMark === "," ? /\./g : /,/g, "").replace(decimalMark, ".")) || 0;
  }
  if (comma !== -1) return Number(normalized.replace(/\./g, "").replace(",", ".")) || 0;
  if (dot !== -1 && normalized.length - dot - 1 === 3) return Number(normalized.replace(/\./g, "")) || 0;
  return Number(normalized) || 0;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function DecisionButton({ type, children, onClick, active }) {
  return (
    <button className={`agent-payments__decision agent-payments__decision--${type}${active ? " is-active" : ""}`} type="button" onClick={onClick} aria-pressed={active}>
      <Icon src={type === "approved" ? checkIcon : xIcon} /><span>{children}</span>
    </button>
  );
}

export default function PaymentsAndCollections() {
  const [query, setQuery] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Noviembre");
  const [decision, setDecision] = useState("");
  const [concepts, setConcepts] = useState(initialConcepts.map((concept, index) => ({ ...concept, id: `concept-${index}` })));
  const [adding, setAdding] = useState("");
  const [newConcept, setNewConcept] = useState({ label: "", amount: "" });
  const [feedback, setFeedback] = useState("");

  const visiblePeople = people.filter((person) => `${person.name} ${person.property}`.toLocaleLowerCase("es-AR").includes(query.trim().toLocaleLowerCase("es-AR")));
  const selectedConcepts = concepts.filter((concept) => concept.checked);
  const total = selectedConcepts.reduce((sum, concept) => sum + parseAmount(concept.amount), 0);
  const currentStatus = decision === "approved" ? "Pagado" : decision === "rejected" ? "No pagado" : selectedPerson.status;

  function choosePerson(person) {
    setSelectedPerson(person);
    setDecision("");
    setFeedback("");
    setPeopleOpen(false);
  }

  function updateConcept(id, changes) {
    setConcepts((current) => current.map((concept) => concept.id === id ? { ...concept, ...changes } : concept));
  }

  function decide(value) {
    setDecision(value);
    setFeedback(value === "approved" ? "El pago fue marcado como pagado." : "El pago fue marcado como no pagado.");
  }

  function submitConcept(event) {
    event.preventDefault();
    const label = newConcept.label.trim();
    if (!label || parseAmount(newConcept.amount) <= 0) {
      setFeedback("Ingresá un concepto y un importe mayor a cero.");
      return;
    }
    setConcepts((current) => [...current, { id: `concept-${Date.now()}`, label, amount: newConcept.amount.trim(), tone: adding === "temporary" ? "blue" : "green", checked: true }]);
    setFeedback(`${label} se agregó al detalle del cobro.`);
    setNewConcept({ label: "", amount: "" });
    setAdding("");
  }

  return (
    <main id="agent-payments">
      <header className="agent-payments__hero">
        <h1>Pagos y cobros</h1>
        <p className="agent-payments__hero-desktop">Estos pagos y cobros se pueden consultar desde la sección Pagos de propietarios y locatarios.</p>
        <p className="agent-payments__hero-mobile">Gestioná los pagos y cobros de tus inquilinos o propietarios.</p>
      </header>

      <div className="agent-payments__layout">
        {peopleOpen && <button className="agent-payments__people-backdrop" type="button" aria-label="Cerrar personas" onClick={() => setPeopleOpen(false)} />}
        <aside className={`agent-payments__people${peopleOpen ? " is-open" : ""}`} aria-label="Personas">
          <div className="agent-payments__people-heading"><h2>Personas</h2><button type="button" onClick={() => setPeopleOpen(false)} aria-label="Cerrar personas">×</button></div>
          <label className="agent-payments__search"><Icon src={magnifyingGlassIcon} /><input type="search" placeholder="Buscar persona..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar persona" /></label>
          {[{ type: "Locatario", title: "Locatarios" }, { type: "Propietario", title: "Propietarios" }].map((group) => (
            <div className="agent-payments__people-group" key={group.type}>
              <button className="agent-payments__group-toggle" type="button" onClick={() => setOpenGroup((current) => current === group.type ? "" : group.type)} aria-expanded={openGroup === group.type}>{group.title}<span aria-hidden="true">‹</span></button>
              {openGroup === group.type && <div className="agent-payments__people-list">
                {visiblePeople.filter((person) => person.type === group.type).map((person) => <button className={`agent-payments__person${selectedPerson.name === person.name ? " is-selected" : ""}`} type="button" key={person.name} onClick={() => choosePerson(person)}>
                  <span className="agent-payments__avatar">{person.name.split(" ").map((word) => word[0]).join("")}</span>
                  <span className="agent-payments__person-copy"><strong>{person.name}</strong><small>{person.property}</small></span>
                  <span className="agent-payments__person-status">{person.status}</span>
                </button>)}
                {!visiblePeople.some((person) => person.type === group.type) && <p className="agent-payments__people-empty">No se encontraron personas.</p>}
              </div>}
            </div>
          ))}
        </aside>

        <section className="agent-payments__workspace" aria-label="Pago seleccionado">
          <div className="agent-payments__toolbar">
            <div className="agent-payments__record">
              <label className="agent-payments__year"><span className="sr-only">Año</span><select value={year} onChange={(event) => setYear(event.target.value)}>{["2025", "2026", "2027"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="agent-payments__month"><span className="sr-only">Mes</span><select value={month} onChange={(event) => setMonth(event.target.value)}>{months.map((value) => <option key={value}>{value}</option>)}</select></label>
              <button className="agent-payments__selected-person" type="button" onClick={() => { setPeopleOpen(true); setOpenGroup(selectedPerson.type); }} aria-label={`Seleccionar persona. Actual: ${selectedPerson.name}`}>{selectedPerson.name}<span aria-hidden="true">⌄</span></button>
              <span className="agent-payments__rent">Alquiler</span>
              <output className="agent-payments__rent-amount" aria-label="Importe del alquiler">{selectedPerson.amount}</output>
            </div>
            <div className="agent-payments__decisions">
              <DecisionButton type="rejected" active={decision === "rejected"} onClick={() => decide("rejected")}>Marcar como no pagado</DecisionButton>
              <DecisionButton type="approved" active={decision === "approved"} onClick={() => decide("approved")}>Marcar como pagado</DecisionButton>
            </div>
          </div>

          <div className="agent-payments__record-grid">
            <article className="agent-payments__property-card">
              <div className="agent-payments__property-main">
                <div className="agent-payments__property-copy"><h2>{selectedPerson.property}</h2><p>Estado: {currentStatus.toLocaleLowerCase("es-AR")}</p><p>Actualización del alquiler: 20/10/26</p><p>Servicios incluidos: No</p></div>
                <div className="agent-payments__concepts" aria-label="Conceptos del cobro">
                  {concepts.map((concept) => <div className={`agent-payments__concept agent-payments__concept--${concept.tone}${concept.checked ? " is-selected" : ""}`} key={concept.id}>
                    <input id={concept.id} type="checkbox" checked={concept.checked} onChange={(event) => updateConcept(concept.id, { checked: event.target.checked })} />
                    <label htmlFor={concept.id}>{concept.label}</label>
                    <input className="agent-payments__amount" type="text" inputMode="decimal" value={concept.amount} onChange={(event) => updateConcept(concept.id, { amount: event.target.value })} aria-label={`Importe de ${concept.label}`} />
                    <span className="agent-payments__info" title={concept.checked ? "Incluido en el detalle del cobro" : "Marcá el concepto para incluirlo en el detalle del cobro"} aria-label={concept.checked ? "Incluido en el detalle del cobro" : "No incluido en el detalle del cobro"}><Icon src={circleInfoIcon} /></span>
                  </div>)}
                </div>
                <div className="agent-payments__concept-actions">
                  <button type="button" onClick={() => { setAdding("permanent"); setFeedback(""); }}><Icon src={plusIconWhite} />Nuevo concepto</button>
                  <button type="button" onClick={() => { setAdding("temporary"); setFeedback(""); }}><Icon src={plusIconWhite} />Concepto temporal</button>
                </div>
                {adding && <form className="agent-payments__new-concept" onSubmit={submitConcept}>
                  <label><span>Concepto {adding === "temporary" ? "temporal" : "nuevo"}</span><input autoFocus value={newConcept.label} onChange={(event) => setNewConcept((current) => ({ ...current, label: event.target.value }))} placeholder="Nombre" /></label>
                  <label><span>Importe</span><input inputMode="decimal" value={newConcept.amount} onChange={(event) => setNewConcept((current) => ({ ...current, amount: event.target.value }))} placeholder="0,00" /></label>
                  <div><button type="button" onClick={() => { setAdding(""); setNewConcept({ label: "", amount: "" }); }}>Cancelar</button><button type="submit">Agregar</button></div>
                </form>}
              </div>
              <aside className="agent-payments__receipt" aria-label="Comprobante del inquilino"><div className="agent-payments__receipt-preview"><Icon src={imageIcon} /></div><div className="agent-payments__receipt-caption"><Icon src={fileLinesIcon} /><span>Comprobante del inquilino</span></div></aside>
            </article>

            <div className="agent-payments__summary-column">
              <aside className="agent-payments__total" aria-label="Detalle del cobro">
                <h2>Detalle del cobro</h2>
                <div className="agent-payments__total-lines">{selectedConcepts.length ? selectedConcepts.map((concept) => <div className="agent-payments__total-line" key={concept.id}><span>{concept.label}</span><b>{formatCurrency(parseAmount(concept.amount))}</b></div>) : <p className="agent-payments__total-empty">Seleccioná conceptos para ver el detalle.</p>}</div>
                <div className="agent-payments__total-sum"><span>Total:</span><b>{formatCurrency(total)}</b></div>
              </aside>
              <button className="agent-payments__send" type="button" onClick={() => setFeedback("El pago fue enviado al propietario.")} disabled={total <= 0}><Icon src={paperPlaneIcon} />Enviar pago</button>
            </div>
          </div>
          <p className="agent-payments__feedback" role="status" aria-live="polite">{feedback}</p>
        </section>
      </div>
    </main>
  );
}
