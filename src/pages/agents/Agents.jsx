import { useMemo, useState } from "react";
import {
  clockIcon,
  envelopeIcon,
  fileLinesIcon as fileIcon,
  locationDotIcon as locationIcon,
  magnifyingGlassIcon,
  peopleIcon,
  phoneIcon,
  plusIcon,
  xIcon,
} from "../../assets/icons";
import { DropdownSelect, Button, SummaryPill, PersonModal, ConfirmDeleteModal, EntityActions } from "../../components";
import "./Agents.css";

const initialAgents = [
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", zone: "Palermo", properties: "120" },
];

const zones = ["Todas las zonas", "Palermo", "Belgrano", "Recoleta"];

const summaryCards = [
  { label: "Seguimientos pendientes", value: "2", icon: xIcon, tone: "danger" },
  { label: "Visitas de hoy", value: "10", icon: clockIcon, tone: "warning" },
  { label: "Agentes activos", value: "24", icon: peopleIcon, tone: "success" },
  { label: "Operaciones activas", value: "18", icon: fileIcon, tone: "info" },
];


function ZoneFilter({ value, onChange }) {
  return (
    <DropdownSelect
      label="Zona asignada"
      placeholder="Zona"
      value={value}
      options={zones}
      onChange={onChange}
      icon={locationIcon}
      className="agents__filter"
      triggerClassName="agents__filter-trigger"
      iconClassName="agents__filter-icon"
      chevronClassName="agents__filter-chevron"
    />
  );
}

function AgentRow({ agent, onEdit, onDelete }) {
  return (
    <tr>
      <td data-label="Agente">
        <div className="agents__person">
          <span className="agents__avatar">{agent.initials}</span>
          <span className="agents__person-copy"><strong>{agent.name}</strong><small>DNI {agent.dni}</small></span>
        </div>
      </td>
      <td data-label="Correo">
        <span className="agents__contact"><img src={envelopeIcon} alt="" />{agent.email}</span>
      </td>
      <td data-label="Teléfono">
        <span className="agents__contact"><img src={phoneIcon} alt="" />{agent.phone}</span>
      </td>
      <td data-label="Zona asignada"><strong>{agent.zone}</strong></td>
      <td data-label="Propiedades asignadas"><strong>{agent.properties}</strong></td>
      <td data-label="Acciones" className="agents__actions-cell">
        <EntityActions entity="agente" name={agent.name} onEdit={() => onEdit(agent)} onDelete={() => onDelete(agent)} />
      </td>
    </tr>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState(() => initialAgents.map((agent, index) => ({ ...agent, id: index + 1, status: "Activo" })));
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(zones[0]);
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");

  const visibleAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const matchesQuery = !normalizedQuery || [agent.name, agent.dni, agent.email, agent.zone].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesZone = zone === zones[0] || agent.zone === zone;
      return matchesQuery && matchesZone;
    });
  }, [agents, query, zone]);

  function saveAgent(data) {
    if (modal.mode === "edit") {
      setAgents((current) => current.map((agent) => agent.id === modal.person.id ? { ...agent, ...data } : agent));
      setNotice("Agente actualizado correctamente.");
    } else {
      setAgents((current) => [...current, { ...data, id: Math.max(0, ...current.map((agent) => agent.id)) + 1, properties: "0" }]);
      setNotice("Agente creado correctamente.");
    }
    setModal(null);
  }

  function deleteAgent() {
    setAgents((current) => current.filter((agent) => agent.id !== pendingDelete.id));
    setPendingDelete(null);
    setNotice("Agente eliminado correctamente.");
  }

  return (
    <main id="agents">
      <div className="agents__page">
        <section className="agents__overview" aria-labelledby="agents-title">
          <div className="agents__hero">
            <h1 id="agents-title">Agentes</h1>
            <p>Gestiona la información de todos los agentes</p>
          </div>
          <div className="agents__summary" aria-label="Resumen de agentes">
            {summaryCards.map((card) => (
              <SummaryPill key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="agents__toolbar" aria-label="Buscar y filtrar agentes">
          <label className="agents__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input type="search" placeholder="Buscar contacto..." aria-label="Buscar contacto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <ZoneFilter value={zone} onChange={setZone} />
          <Button className="agents__new-button" onClick={() => setModal({ mode: "create", person: null })} icon={plusIcon} text="Nuevo agente" />
        </section>

        <section className="agents__table-card" aria-label="Listado de agentes">
          <div className="agents__table-wrap">
            <table>
              <thead><tr><th>Agente</th><th>Correo</th><th>Teléfono</th><th>Zona asignada</th><th>Propiedades asignadas</th><th>Acciones</th></tr></thead>
              <tbody>{visibleAgents.map((agent) => <AgentRow key={agent.id} agent={agent} onEdit={(person) => setModal({ mode: "edit", person })} onDelete={setPendingDelete} />)}</tbody>
            </table>
          </div>
          {!visibleAgents.length && <p className="agents__empty">No encontramos agentes con esos criterios.</p>}
        </section>
      </div>

      {notice && <p className="agents__notice" role="status">{notice}</p>}

      {modal && <PersonModal kind="agent" mode={modal.mode} person={modal.person} onClose={() => setModal(null)} onSubmit={saveAgent} />}
      <ConfirmDeleteModal isOpen={Boolean(pendingDelete)} title="¿Seguro que desea eliminar un agente?" onClose={() => setPendingDelete(null)} onConfirm={deleteAgent} />
    </main>
  );
}
