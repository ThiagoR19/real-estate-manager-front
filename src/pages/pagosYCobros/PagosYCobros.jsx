import { useState } from "react";
import {
  angleDownIcon,
  checkIcon,
  circleInfoIcon,
  fileLinesIcon,
  imageIcon,
  magnifyingGlassIcon,
  paperPlaneIcon,
  plusIconWhite,
  xIcon,
} from "../../assets/icons";
import "./PagosYCobros.css";

const people = [
  {
    name: "Maria Shakira",
    type: "Locatario",
    property: "Propiedad baldez B2",
    amount: "14933.10",
    status: "Sin enviar",
  },
  {
    name: "Sofia Ramirez",
    type: "Locatario",
    property: "Casa de San Isidro",
    amount: "600.000,10",
    status: "Pendiente",
  },
  {
    name: "Juan Pérez",
    type: "Propietario",
    property: "Bielke 454",
    amount: "550.000,10",
    status: "Aprobado",
  },
];

const initialConcepts = [
  { label: "Electricidad", amount: "14933.10", tone: "muted", checked: false },
  { label: "Agua", amount: "14933.10", tone: "muted", checked: false },
  { label: "Expensas", amount: "49103", tone: "green", checked: true },
  { label: "Otros", amount: "49103", tone: "green", checked: true },
  { label: "Reparación", amount: "192.912,21", tone: "blue", checked: true },
];

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function Icono({ src }) {
  return <img className="pagos-agente__icon" src={src} alt="" aria-hidden="true" />;
}

function parseAmount(value) {
  const normalized = String(value)
    .trim()
    .replace(/[^\d,.-]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma !== -1 && dot !== -1) {
    const decimalMark = comma > dot ? "," : ".";
    return (
      Number(
        normalized.replace(decimalMark === "," ? /\./g : /,/g, "").replace(decimalMark, "."),
      ) || 0
    );
  }
  if (comma !== -1) return Number(normalized.replace(/\./g, "").replace(",", ".")) || 0;
  if (dot !== -1 && normalized.length - dot - 1 === 3)
    return Number(normalized.replace(/\./g, "")) || 0;
  return Number(normalized) || 0;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}

function BotonDecision({ type, children, onClick, active }) {
  return (
    <button
      className={`pagos-agente__decision pagos-agente__decision--${type}${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      <Icono src={type === "approved" ? checkIcon : xIcon} />
      <span>{children}</span>
    </button>
  );
}

export default function PagosYCobros() {
  const [query, setQuery] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Noviembre");
  const [decision, setDecision] = useState("");
  const [concepts, setConcepts] = useState(
    initialConcepts.map((concept, index) => ({ ...concept, id: `concept-${index}` })),
  );
  const [adding, setAdding] = useState("");
  const [newConcept, setNewConcept] = useState({ label: "", amount: "" });
  const [feedback, setFeedback] = useState("");

  const visiblePeople = people.filter((person) =>
    `${person.name} ${person.property}`
      .toLocaleLowerCase("es-AR")
      .includes(query.trim().toLocaleLowerCase("es-AR")),
  );
  const selectedConcepts = concepts.filter((concept) => concept.checked);
  const total = selectedConcepts.reduce((sum, concept) => sum + parseAmount(concept.amount), 0);
  const currentStatus =
    decision === "approved"
      ? "Pagado"
      : decision === "rejected"
        ? "No pagado"
        : selectedPerson.status;

  function choosePerson(person) {
    setSelectedPerson(person);
    setDecision("");
    setFeedback("");
    setPeopleOpen(false);
  }

  function updateConcept(id, changes) {
    setConcepts((current) =>
      current.map((concept) => (concept.id === id ? { ...concept, ...changes } : concept)),
    );
  }

  function decide(value) {
    setDecision(value);
    setFeedback(
      value === "approved"
        ? "El pago fue marcado como pagado."
        : "El pago fue marcado como no pagado.",
    );
  }

  function submitConcept(event) {
    event.preventDefault();
    const label = newConcept.label.trim();
    if (!label || parseAmount(newConcept.amount) <= 0) {
      setFeedback("Ingresá un concepto y un importe mayor a cero.");
      return;
    }
    setConcepts((current) => [
      ...current,
      {
        id: `concept-${Date.now()}`,
        label,
        amount: newConcept.amount.trim(),
        tone: adding === "temporary" ? "blue" : "green",
        checked: true,
      },
    ]);
    setFeedback(`${label} se agregó al detalle del cobro.`);
    setNewConcept({ label: "", amount: "" });
    setAdding("");
  }

  return (
    <main id="pagos-agente">
      <header className="pagos-agente__hero">
        <h1>Pagos y cobros</h1>
        <p className="pagos-agente__hero-desktop">
          Estos pagos y cobros se pueden consultar desde la sección Pagos de propietarios y
          locatarios.
        </p>
        <p className="pagos-agente__hero-mobile">
          Gestioná los pagos y cobros de tus inquilinos o propietarios.
        </p>
      </header>

      <div className="pagos-agente__layout">
        {peopleOpen && (
          <button
            className="pagos-agente__people-backdrop"
            type="button"
            aria-label="Cerrar personas"
            onClick={() => setPeopleOpen(false)}
          />
        )}
        <aside
          className={`pagos-agente__people${peopleOpen ? " is-open" : ""}`}
          aria-label="Personas"
        >
          <div className="pagos-agente__people-heading">
            <h2>Personas</h2>
            <button type="button" onClick={() => setPeopleOpen(false)} aria-label="Cerrar personas">
              ×
            </button>
          </div>
          <label className="pagos-agente__search">
            <Icono src={magnifyingGlassIcon} />
            <input
              type="search"
              placeholder="Buscar persona..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar persona"
            />
          </label>
          {[
            { type: "Locatario", title: "Locatarios" },
            { type: "Propietario", title: "Propietarios" },
          ].map((group) => (
            <div className="pagos-agente__people-group" key={group.type}>
              <button
                className="pagos-agente__group-toggle"
                type="button"
                onClick={() =>
                  setOpenGroup((current) => (current === group.type ? "" : group.type))
                }
                aria-expanded={openGroup === group.type}
              >
                {group.title}
                <span aria-hidden="true">‹</span>
              </button>
              {openGroup === group.type && (
                <div className="pagos-agente__people-list">
                  {visiblePeople
                    .filter((person) => person.type === group.type)
                    .map((person) => (
                      <button
                        className={`pagos-agente__person${selectedPerson.name === person.name ? " is-selected" : ""}`}
                        type="button"
                        key={person.name}
                        onClick={() => choosePerson(person)}
                      >
                        <span className="pagos-agente__avatar">
                          {person.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>
                        <span className="pagos-agente__person-copy">
                          <strong>{person.name}</strong>
                          <small>{person.property}</small>
                        </span>
                        <span className="pagos-agente__person-status">{person.status}</span>
                      </button>
                    ))}
                  {!visiblePeople.some((person) => person.type === group.type) && (
                    <p className="pagos-agente__people-empty">No se encontraron personas.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </aside>

        <section className="pagos-agente__workspace" aria-label="Pago seleccionado">
          <div className="pagos-agente__toolbar">
            <div className="pagos-agente__record">
              <label className="pagos-agente__year">
                <span className="sr-only">Año</span>
                <select value={year} onChange={(event) => setYear(event.target.value)}>
                  {["2025", "2026", "2027"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="pagos-agente__month">
                <span className="sr-only">Mes</span>
                <select value={month} onChange={(event) => setMonth(event.target.value)}>
                  {months.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <button
                className="pagos-agente__selected-person"
                type="button"
                onClick={() => {
                  setPeopleOpen(true);
                  setOpenGroup(selectedPerson.type);
                }}
                aria-label={`Seleccionar persona. Actual: ${selectedPerson.name}`}
              >
                {selectedPerson.name}
                <Icono src={angleDownIcon} />
              </button>
              <span className="pagos-agente__rent">Alquiler</span>
              <output className="pagos-agente__rent-amount" aria-label="Importe del alquiler">
                {selectedPerson.amount}
              </output>
            </div>
            <div className="pagos-agente__decisions">
              <BotonDecision
                type="rejected"
                active={decision === "rejected"}
                onClick={() => decide("rejected")}
              >
                Marcar como no pagado
              </BotonDecision>
              <BotonDecision
                type="approved"
                active={decision === "approved"}
                onClick={() => decide("approved")}
              >
                Marcar como pagado
              </BotonDecision>
            </div>
          </div>

          <div className="pagos-agente__record-grid">
            <article className="pagos-agente__propiedad-card">
              <div className="pagos-agente__propiedad-main">
                <div className="pagos-agente__propiedad-copy">
                  <h2>{selectedPerson.property}</h2>
                  <p>Estado: {currentStatus.toLocaleLowerCase("es-AR")}</p>
                  <p>Actualización del alquiler: 20/10/26</p>
                  <p>Servicios incluidos: No</p>
                </div>
                <div className="pagos-agente__concepts" aria-label="Conceptos del cobro">
                  {concepts.map((concept) => (
                    <div
                      className={`pagos-agente__concept pagos-agente__concept--${concept.tone}${concept.checked ? " is-selected" : ""}`}
                      key={concept.id}
                    >
                      <input
                        id={concept.id}
                        type="checkbox"
                        checked={concept.checked}
                        onChange={(event) =>
                          updateConcept(concept.id, { checked: event.target.checked })
                        }
                      />
                      <label htmlFor={concept.id}>{concept.label}</label>
                      <input
                        className="pagos-agente__amount"
                        type="text"
                        inputMode="decimal"
                        value={concept.amount}
                        onChange={(event) =>
                          updateConcept(concept.id, { amount: event.target.value })
                        }
                        aria-label={`Importe de ${concept.label}`}
                      />
                      <span
                        className="pagos-agente__info"
                        title={
                          concept.checked
                            ? "Incluido en el detalle del cobro"
                            : "Marcá el concepto para incluirlo en el detalle del cobro"
                        }
                        aria-label={
                          concept.checked
                            ? "Incluido en el detalle del cobro"
                            : "No incluido en el detalle del cobro"
                        }
                      >
                        <Icono src={circleInfoIcon} />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pagos-agente__concept-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setAdding("permanent");
                      setFeedback("");
                    }}
                  >
                    <Icono src={plusIconWhite} />
                    Nuevo concepto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdding("temporary");
                      setFeedback("");
                    }}
                  >
                    <Icono src={plusIconWhite} />
                    Concepto temporal
                  </button>
                </div>
                {adding && (
                  <form className="pagos-agente__new-concept" onSubmit={submitConcept}>
                    <label>
                      <span>Concepto {adding === "temporary" ? "temporal" : "nuevo"}</span>
                      <input
                        autoFocus
                        value={newConcept.label}
                        onChange={(event) =>
                          setNewConcept((current) => ({ ...current, label: event.target.value }))
                        }
                        placeholder="Nombre"
                      />
                    </label>
                    <label>
                      <span>Importe</span>
                      <input
                        inputMode="decimal"
                        value={newConcept.amount}
                        onChange={(event) =>
                          setNewConcept((current) => ({ ...current, amount: event.target.value }))
                        }
                        placeholder="0,00"
                      />
                    </label>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdding("");
                          setNewConcept({ label: "", amount: "" });
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit">Agregar</button>
                    </div>
                  </form>
                )}
              </div>
              <aside className="pagos-agente__receipt" aria-label="Comprobante del inquilino">
                <div className="pagos-agente__receipt-preview">
                  <Icono src={imageIcon} />
                </div>
                <div className="pagos-agente__receipt-caption">
                  <Icono src={fileLinesIcon} />
                  <span>Comprobante del inquilino</span>
                </div>
              </aside>
            </article>

            <div className="pagos-agente__summary-column">
              <aside className="pagos-agente__total" aria-label="Detalle del cobro">
                <h2>Detalle del cobro</h2>
                <div className="pagos-agente__total-lines">
                  {selectedConcepts.length ? (
                    selectedConcepts.map((concept) => (
                      <div className="pagos-agente__total-line" key={concept.id}>
                        <span>{concept.label}</span>
                        <b>{formatCurrency(parseAmount(concept.amount))}</b>
                      </div>
                    ))
                  ) : (
                    <p className="pagos-agente__total-empty">
                      Seleccioná conceptos para ver el detalle.
                    </p>
                  )}
                </div>
                <div className="pagos-agente__total-sum">
                  <span>Total:</span>
                  <b>{formatCurrency(total)}</b>
                </div>
              </aside>
              <button
                className="pagos-agente__send"
                type="button"
                onClick={() => setFeedback("El pago fue enviado al propietario.")}
                disabled={total <= 0}
              >
                <Icono src={paperPlaneIcon} />
                Enviar pago
              </button>
            </div>
          </div>
          <p className="pagos-agente__feedback" role="status" aria-live="polite">
            {feedback}
          </p>
        </section>
      </div>
    </main>
  );
}
