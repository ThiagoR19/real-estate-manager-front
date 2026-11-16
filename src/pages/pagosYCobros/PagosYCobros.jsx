import { useEffect, useState } from "react";
import {
  angleDownIcon,
  checkIcon,
  circleInfoIcon,
  fileLinesIcon,
  imageIcon,
  paperPlaneIcon,
  plusIconWhite,
  xIcon,
} from "../../assets/icons";
import { PanelDeslizable } from "../../components";
import useConsultaMedia from "../../hooks/useConsultaMedia";
import "./PagosYCobros.css";

const people = [
  {
    id: "persona-1",
    name: "Enrrique Moyano",
    type: "Locatario",
    properties: [
      {
        id: "propiedad-1",
        name: "Departamento Belgrano 4A",
        amount: "320000",
        status: "Sin enviar",
        update: "15/12/26",
        services: false,
        receipt: null,
      },
    ],
  },
  {
    id: "persona-2",
    name: "Maria Shakira",
    type: "Locatario",
    properties: [
      {
        id: "propiedad-2",
        name: "Propiedad baldez B2",
        amount: "14933.10",
        status: "Sin enviar",
        update: "20/10/26",
        services: false,
        receipt: null,
      },
      {
        id: "propiedad-3",
        name: "Casa de San Isidro",
        amount: "600.000,10",
        status: "Revisión",
        update: "01/03/27",
        services: true,
        receipt: { date: "06/02/2023 - 14:32 hs" },
      },
    ],
  },
  {
    id: "persona-3",
    name: "Sofia Ramirez",
    type: "Locatario",
    properties: [
      {
        id: "propiedad-4",
        name: "Depto Palermo 2B",
        amount: "410.500,00",
        status: "Pago",
        update: "10/08/27",
        services: false,
        receipt: { date: "02/11/2026 - 09:15 hs" },
      },
    ],
  },
  {
    id: "persona-4",
    name: "Juan Pérez",
    type: "Propietario",
    properties: [
      {
        id: "propiedad-5",
        name: "Bielke 454",
        amount: "550.000,10",
        status: "Pago",
        update: "05/05/27",
        services: true,
        receipt: { date: "01/11/2026 - 18:40 hs" },
      },
    ],
  },
];

const groups = [
  { type: "Locatario", title: "Locatarios" },
  { type: "Propietario", title: "Propietarios" },
];

const initialConcepts = [
  { label: "Electricidad", amount: "14933.10", tone: "muted", checked: false },
  { label: "Agua", amount: "14933.10", tone: "muted", checked: false },
  { label: "Expensas", amount: "49103", tone: "green", checked: true },
  { label: "Otros", amount: "49103", tone: "green", checked: true },
  { label: "Reparación", amount: "192.912,21", tone: "blue", checked: true },
];

const LOCKED_STATUSES = ["Revisión", "Pago", "Enviado"];

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
  const normalized = String(value).trim().replace(/[^\d,.-]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");

  if (comma !== -1 && dot !== -1) {
    const decimalMark = comma > dot ? "," : ".";
    return (Number(normalized.replace(decimalMark === "," ? /\./g : /,/g, "").replace(decimalMark, "."),) || 0);
  }
  if (comma !== -1) return Number(normalized.replace(/\./g, "").replace(",", ".")) || 0;
  if (dot !== -1 && normalized.length - dot - 1 === 3) return Number(normalized.replace(/\./g, "")) || 0;

  return Number(normalized) || 0;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}

function soloNumeros(valor) {
  return valor.replace(/[^\d.,]/g, "");
}

function conceptosIniciales(idPropiedad) {
  return initialConcepts.map((concept, index) => ({ ...concept, id: `${idPropiedad}-concepto-${index}` }));
}

function normalizar(texto) {
  return texto.toLocaleLowerCase("es-AR").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Chevron({ open }) {
  return (
    <img
      className={`pagos-agente__chevron${open ? " is-open" : ""}`}
      src={angleDownIcon}
      alt=""
      aria-hidden="true"
    />
  );
}

function BotonDecision({ type, children, onClick, active, neutral }) {
  return (
    <button
      className={`pagos-agente__decision pagos-agente__decision--${neutral ? "neutral" : type}${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="pagos-agente__decision-icon">
        <Icono src={type === "approved" ? checkIcon : xIcon} />
      </span>
      <span>{children}</span>
    </button>
  );
}

function PanelPersonas({ query, selected, onSelect }) {
  const [openGroup, setOpenGroup] = useState(selected.type);
  const [openPerson, setOpenPerson] = useState(selected.personId);
  const buscando = query.trim() !== "";
  const termino = normalizar(query.trim());

  const visibles = people
    .map((person) => {
      if (!buscando || normalizar(person.name).includes(termino)) return person;
      const properties = person.properties.filter((property) =>
        normalizar(property.name).includes(termino),
      );
      return properties.length ? { ...person, properties } : null;
    })
    .filter(Boolean);

  return (
    <div className="pagos-agente__people-panel">
      <h2 className="pagos-agente__people-title">Personas</h2>
      {groups.map((group) => {
        const grupoAbierto = buscando || openGroup === group.type;
        const integrantes = visibles.filter((person) => person.type === group.type);
        return (
          <div className="pagos-agente__people-group" key={group.type}>
            <button
              className="pagos-agente__group-toggle"
              type="button"
              onClick={() => setOpenGroup((current) => (current === group.type ? "" : group.type))}
              aria-expanded={grupoAbierto}
            >
              {group.title}
              <Chevron open={grupoAbierto} />
            </button>
            {grupoAbierto && (
              <ul className="pagos-agente__people-list">
                {integrantes.map((person) => {
                  const personaAbierta = buscando || openPerson === person.id;
                  return (
                    <li key={person.id}>
                      <button
                        className={`pagos-agente__person${selected.personId === person.id ? " is-selected" : ""}`}
                        type="button"
                        onClick={() => setOpenPerson((current) => (current === person.id ? "" : person.id))}
                        aria-expanded={personaAbierta}
                      >
                        <span>{person.name}</span>
                        <Chevron open={personaAbierta} />
                      </button>
                      {personaAbierta && (
                        <ul className="pagos-agente__properties-list">
                          {person.properties.map((property) => (
                            <li key={property.id}>
                              <button
                                className={`pagos-agente__property-option${selected.propertyId === property.id ? " is-selected" : ""}`}
                                type="button"
                                onClick={() => onSelect(person, property)}
                                aria-current={selected.propertyId === property.id ? "true" : undefined}
                              >
                                {property.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
                {!integrantes.length && (
                  <li className="pagos-agente__people-empty">No se encontraron personas.</li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PagosYCobros() {
  const esMovil = useConsultaMedia("(max-width: 1024px)");
  const [query, setQuery] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [selected, setSelected] = useState({
    personId: people[1].id,
    propertyId: people[1].properties[0].id,
    type: people[1].type,
  });
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("Noviembre");
  const [statuses, setStatuses] = useState({});
  const [conceptsByProperty, setConceptsByProperty] = useState({});
  const [rentByProperty, setRentByProperty] = useState({});
  const [adding, setAdding] = useState("");
  const [newConcept, setNewConcept] = useState({ label: "", amount: "" });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const alBuscar = (evento) => setQuery(evento.detail ?? "");
    window.addEventListener("personas-search", alBuscar);
    return () => window.removeEventListener("personas-search", alBuscar);
  }, []);

  const selectedPerson = people.find((person) => person.id === selected.personId);
  const selectedProperty = selectedPerson.properties.find(
    (property) => property.id === selected.propertyId,
  );
  const concepts = conceptsByProperty[selectedProperty.id] ?? conceptosIniciales(selectedProperty.id);
  const rent = rentByProperty[selectedProperty.id] ?? selectedProperty.amount;
  const currentStatus = statuses[selectedProperty.id] ?? selectedProperty.status;
  const locked = LOCKED_STATUSES.includes(currentStatus);
  const selectedConcepts = concepts.filter((concept) => concept.checked);
  const total = selectedConcepts.reduce((sum, concept) => sum + parseAmount(concept.amount), 0);
  const receipt = selectedProperty.receipt;

  function choose(person, property) {
    setSelected({ personId: person.id, propertyId: property.id, type: person.type });
    setAdding("");
    setFeedback("");
    setPeopleOpen(false);
  }

  function updateConcepts(update) {
    setConceptsByProperty((current) => ({
      ...current,
      [selectedProperty.id]: update(current[selectedProperty.id] ?? conceptosIniciales(selectedProperty.id)),
    }));
  }

  function updateConcept(id, changes) {
    updateConcepts((list) =>
      list.map((concept) => (concept.id === id ? { ...concept, ...changes } : concept)),
    );
  }

  function setStatus(status) {
    setStatuses((current) => ({ ...current, [selectedProperty.id]: status }));
  }

  function decide(value) {
    setStatus(value === "approved" ? "Pago" : "Impago");
    setAdding("");
    setFeedback(
      value === "approved"
        ? "El pago fue marcado como pagado."
        : "El pago fue marcado como impagado.",
    );
  }

  function sendPayment() {
    setStatus("Enviado");
    setAdding("");
    setFeedback(`El cobro fue enviado a ${selectedPerson.name}.`);
  }

  function submitConcept(event) {
    event.preventDefault();
    const label = newConcept.label.trim();
    if (!label || parseAmount(newConcept.amount) <= 0) {
      setFeedback("Ingresá un concepto y un importe mayor a cero.");
      return;
    }
    updateConcepts((list) => [
      ...list,
      {
        id: `${selectedProperty.id}-concepto-${Date.now()}`,
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

  const panel = <PanelPersonas query={query} selected={selected} onSelect={choose} />;

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
        {esMovil ? (
          <PanelDeslizable
            etiqueta="Personas"
            ancho="min(340px, 88vw)"
            superior="var(--pagos-alto-header, 40px)"
            posicion="32%"
            abierto={peopleOpen}
            onCambiar={setPeopleOpen}
          >
            {panel}
          </PanelDeslizable>
        ) : (
          <aside className="pagos-agente__people" aria-label="Personas">
            {panel}
          </aside>
        )}

        <section className="pagos-agente__workspace" aria-label="Pago seleccionado">
          <div className="pagos-agente__toolbar">
            <div className="pagos-agente__record">
              <div className="pagos-agente__period">
                <label className="pagos-agente__select">
                  <span className="sr-only">Año</span>
                  <select value={year} onChange={(event) => setYear(event.target.value)}>
                    {["2025", "2026", "2027"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <Icono src={angleDownIcon} />
                </label>
                <label className="pagos-agente__select pagos-agente__select--month">
                  <span className="sr-only">Mes</span>
                  <select value={month} onChange={(event) => setMonth(event.target.value)}>
                    {months.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <Icono src={angleDownIcon} />
                </label>
              </div>
              <h2 className="pagos-agente__person-name">{selectedPerson.name}</h2>
              <label className="pagos-agente__rent">
                <span>Alquiler</span>
                <input
                  className="pagos-agente__rent-amount"
                  type="text"
                  inputMode="decimal"
                  value={rent}
                  disabled={locked}
                  onChange={(event) =>
                    setRentByProperty((current) => ({
                      ...current,
                      [selectedProperty.id]: soloNumeros(event.target.value),
                    }))
                  }
                  aria-label="Importe del alquiler"
                />
              </label>
            </div>
            <div className="pagos-agente__decisions">
              <BotonDecision
                type="rejected"
                neutral={currentStatus === "Pago"}
                active={currentStatus === "Impago"}
                onClick={() => decide("rejected")}
              >
                Marcar como impagado
              </BotonDecision>
              <BotonDecision
                type="approved"
                active={currentStatus === "Pago"}
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
                  <h2>{selectedProperty.name}</h2>
                  <p>Estado: {currentStatus}</p>
                  <p>Actualización del alquiler: {selectedProperty.update}</p>
                  <p>Servicios incluidos: {selectedProperty.services ? "Sí" : "No"}</p>
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
                        disabled={locked}
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
                        disabled={locked}
                        onChange={(event) =>
                          updateConcept(concept.id, { amount: soloNumeros(event.target.value) })
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
                    disabled={locked}
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
                    disabled={locked}
                    onClick={() => {
                      setAdding("temporary");
                      setFeedback("");
                    }}
                  >
                    <Icono src={plusIconWhite} />
                    Concepto temporal
                  </button>
                </div>
                {adding && !locked && (
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
                          setNewConcept((current) => ({ ...current, amount: soloNumeros(event.target.value) }))
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
              <aside
                className={`pagos-agente__receipt${receipt ? " has-receipt" : ""}`}
                aria-label="Comprobante del inquilino"
              >
                <div className="pagos-agente__receipt-preview">
                  {receipt?.url ? (
                    <img src={receipt.url} alt="Comprobante del inquilino" />
                  ) : (
                    <Icono src={receipt ? fileLinesIcon : imageIcon} />
                  )}
                </div>
                <div className="pagos-agente__receipt-caption">
                  <Icono src={fileLinesIcon} />
                  <span>
                    Comprobante del inquilino
                    {receipt && <small>{receipt.date}</small>}
                  </span>
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
                onClick={sendPayment}
                disabled={locked || total <= 0}
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
