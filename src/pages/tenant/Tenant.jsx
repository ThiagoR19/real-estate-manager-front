import { useMemo, useState } from "react";
import {
  angleDownIcon,
  calendarIcon,
  clockIcon,
  envelopeIcon,
  fileLinesIcon as fileIcon,
  houseIcon,
  locationDotIcon as locationIcon,
  magnifyingGlassIcon,
  peopleIcon,
  phoneIcon,
  plusIcon,
} from "../../assets/icons";
import propertyImage from "/images.jpg";
import "./Tenant.css";

const tenants = [
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
];

const filters = [
  { label: "Propiedad", icon: houseIcon, options: ["Todas las propiedades", "Av. San Martín 1250", "Av. Santa Fe 850"] },
  { label: "Estado", icon: locationIcon, options: ["Todos los estados", "Activo", "Pendiente", "Finalizado"] },
  { label: "Vencimiento", icon: calendarIcon, options: ["Todos los vencimientos", "Este mes", "Próximos 30 días"] },
];

const summaryCards = [
  { label: "Pagos pendientes", value: "2", icon: "x", tone: "danger" },
  { label: "Contratos por vencer", value: "10", icon: clockIcon, tone: "warning" },
  { label: "Inquilinos activos", value: "24", icon: peopleIcon, tone: "success" },
  { label: "Contratos vigentes", value: "18", icon: fileIcon, tone: "info" },
];

function SummaryIcon({ type }) {
  if (type === "x") return <span className="tenant__summary-x" aria-hidden="true">×</span>;
  return <img src={type} alt="" />;
}

function FilterControl({ filter, value, onChange }) {
  return (
    <label className="tenant__filter">
      <span className="tenant__filter-icon"><img src={filter.icon} alt="" /></span>
      <select aria-label={filter.label} value={value} onChange={(event) => onChange(event.target.value)}>
        {filter.options.map((option) => <option key={option} value={option}>{option === filter.options[0] ? filter.label : option}</option>)}
      </select>
      <img className="tenant__filter-chevron" src={angleDownIcon} alt="" />
    </label>
  );
}

function TenantRow({ tenant, onMenu }) {
  return (
    <tr>
      <td data-label="Inquilino">
        <div className="tenant__person">
          <span className="tenant__avatar">{tenant.initials}</span>
          <span className="tenant__person-copy"><strong>{tenant.name}</strong><small>DNI {tenant.dni}</small></span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="tenant__contact">
          <span><img src={envelopeIcon} alt="" />{tenant.email}</span>
          <span><img src={phoneIcon} alt="" />{tenant.phone}</span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="tenant__property">
          <img className="tenant__property-image" src={propertyImage} alt="" />
          <span><strong>{tenant.address}</strong><small>{tenant.unit}</small></span>
        </div>
      </td>
      <td data-label="Contrato">
        <span className="tenant__contract"><strong>{tenant.contract}</strong><small>{tenant.dates}</small></span>
      </td>
      <td data-label="Estado"><span className="tenant__status">{tenant.status}</span></td>
      <td data-label="Próximo vencimiento"><strong className="tenant__due">{tenant.due}</strong></td>
      <td data-label="Acciones" className="tenant__actions-cell">
        <button className="tenant__actions" type="button" aria-label={`Acciones para ${tenant.name}`} onClick={onMenu}>⋮</button>
      </td>
    </tr>
  );
}

export default function Tenant() {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(filters.map(({ options }) => options[0]));
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");

  const visibleTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchesQuery = !normalizedQuery || [tenant.name, tenant.dni, tenant.email, tenant.address].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesProperty = filterValues[0] === filters[0].options[0] || tenant.address === filterValues[0];
      const matchesStatus = filterValues[1] === filters[1].options[0] || tenant.status === filterValues[1];
      return matchesQuery && matchesProperty && matchesStatus;
    });
  }, [filterValues, query]);

  function updateFilter(index, value) {
    setFilterValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  function showRowNotice() {
    setNotice("Las acciones del inquilino estarán disponibles próximamente.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <main id="tenant">
      <section className="tenant__overview" aria-labelledby="tenant-title">
        <div className="tenant__hero">
          <h1 id="tenant-title">Inquilinos</h1>
          <p>Gestiona la información de todos los inquilinos, sus contratos, pagos y estados.</p>
        </div>
        <div className="tenant__summary" aria-label="Resumen de inquilinos">
          {summaryCards.map((card) => (
            <article className={`tenant__summary-card tenant__summary-card--${card.tone}`} key={card.label}>
              <span className="tenant__summary-icon"><SummaryIcon type={card.icon} /></span>
              <strong>{card.label}</strong>
              <b>{card.value}</b>
            </article>
          ))}
        </div>
      </section>
      <div className="tenant__page">
        <section className="tenant__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="tenant__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input type="search" placeholder="Buscar contacto..." aria-label="Buscar contacto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {filters.map((filter, index) => <FilterControl key={filter.label} filter={filter} value={filterValues[index]} onChange={(value) => updateFilter(index, value)} />)}
          <button className="tenant__new-button" type="button" onClick={() => setShowModal(true)}><img src={plusIcon} alt="" />Nuevo inquilino</button>
        </section>

        <section className="tenant__table-card" aria-label="Listado de inquilinos">
          <div className="tenant__table-wrap">
            <table>
              <thead><tr><th>Inquilino</th><th>Contacto</th><th>Propiedad</th><th>Contrato</th><th>Estado</th><th>Próximo vencimiento</th><th>Acciones</th></tr></thead>
              <tbody>{visibleTenants.map((tenant, index) => <TenantRow key={`${tenant.name}-${index}`} tenant={tenant} onMenu={showRowNotice} />)}</tbody>
            </table>
          </div>
          {!visibleTenants.length && <p className="tenant__empty">No encontramos inquilinos con esos criterios.</p>}
        </section>
      </div>

      {notice && <p className="tenant__notice" role="status">{notice}</p>}

      {showModal && (
        <div className="tenant__modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <section className="tenant__modal" role="dialog" aria-modal="true" aria-labelledby="tenant-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="tenant__modal-close" type="button" aria-label="Cerrar" onClick={() => setShowModal(false)}>×</button>
            <h2 id="tenant-modal-title">Nuevo inquilino</h2>
            <p>Completá los datos del nuevo inquilino para incorporarlo al listado.</p>
            <div className="tenant__modal-fields"><label>Nombre completo<input type="text" placeholder="Ej. Lucía Martínez" /></label><label>Correo electrónico<input type="email" placeholder="nombre@email.com" /></label></div>
            <button className="tenant__modal-submit" type="button" onClick={() => setShowModal(false)}>Guardar inquilino</button>
          </section>
        </div>
      )}
    </main>
  );
}
