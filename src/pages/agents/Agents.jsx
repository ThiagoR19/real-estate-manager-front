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
import DropdownSelect from "../../components/select/DropdownSelect";
import Button from "../../components/button/Button";
import SummaryPill from "../../components/summaryPill/SummaryPill";
import "./Agents.css";

const agents = [
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

function AgentRow({ agent, onMenu }) {
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
        <button className="agents__actions" type="button" aria-label={`Acciones para ${agent.name}`} onClick={onMenu}>⋮</button>
      </td>
    </tr>
  );
}

export default function Agents() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(zones[0]);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");

  const visibleAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const matchesQuery = !normalizedQuery || [agent.name, agent.dni, agent.email, agent.zone].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesZone = zone === zones[0] || agent.zone === zone;
      return matchesQuery && matchesZone;
    });
  }, [query, zone]);

  function showRowNotice() {
    setNotice("Las acciones del agente estarán disponibles próximamente.");
    window.setTimeout(() => setNotice(""), 2800);
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
          <Button className="agents__new-button" onClick={() => setShowModal(true)} icon={plusIcon} text="Nuevo agente" />
        </section>

        <section className="agents__table-card" aria-label="Listado de agentes">
          <div className="agents__table-wrap">
            <table>
              <thead><tr><th>Inquilino</th><th>Correo</th><th>Teléfono</th><th>Zona asignada</th><th>Propiedades asignadas</th><th>Acciones</th></tr></thead>
              <tbody>{visibleAgents.map((agent, index) => <AgentRow key={`${agent.name}-${index}`} agent={agent} onMenu={showRowNotice} />)}</tbody>
            </table>
          </div>
          {!visibleAgents.length && <p className="agents__empty">No encontramos agentes con esos criterios.</p>}
        </section>
      </div>

      {notice && <p className="agents__notice" role="status">{notice}</p>}

      {showModal && (
        <div className="agents__modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <section className="agents__modal" role="dialog" aria-modal="true" aria-labelledby="agents-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="agents__modal-close" type="button" aria-label="Cerrar" onClick={() => setShowModal(false)}>×</button>
            <h2 id="agents-modal-title">Nuevo agente</h2>
            <p>Completá los datos del nuevo agente para incorporarlo al listado.</p>
            <div className="agents__modal-fields"><label>Nombre completo<input type="text" placeholder="Ej. Lucía Martínez" /></label><label>Correo electrónico<input type="email" placeholder="nombre@email.com" /></label></div>
            <Button className="agents__modal-submit" onClick={() => setShowModal(false)} text="Guardar agente" />
          </section>
        </div>
      )}
    </main>
  );
}
