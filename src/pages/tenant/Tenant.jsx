import { useMemo, useState } from "react";
import { calendarIcon, clockIcon, envelopeIcon, fileLinesIcon, houseIcon, locationDotIcon, magnifyingGlassIcon, peopleIcon, penIcon, phoneIcon, plusIcon } from "../../assets/icons";
import { DropdownSelect, TenantModal, Button } from '../../components'
import propertyImage from "/images.jpg";
import "./Tenant.css";

const initialTenants = [
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
  { initials: "LM", name: "Lucía Martínez", dni: "41.234.567", email: "lucia.m@gmail.com", phone: "11 2345- 6789", address: "Av. San Martín 1250", unit: "Depto. 3B", contract: "Alquiler", dates: "01/03/2024 - 28/02/2026", status: "Activo", due: "28/02/2026" },
];

const filters = [
  { label: "Propiedad", icon: houseIcon, options: ["Todas las propiedades", "Av. San Martín 1250", "Av. Santa Fe 850"] },
  { label: "Estado", icon: locationDotIcon, options: ["Todos los estados", "Activo", "Pendiente", "Finalizado"] },
  { label: "Vencimiento", icon: calendarIcon, options: ["Todos los vencimientos", "Este mes", "Próximos 30 días"] },
];

const summaryCards = [
  { label: "Pagos pendientes", value: "2", icon: "x", tone: "danger" },
  { label: "Contratos por vencer", value: "10", icon: clockIcon, tone: "warning" },
  { label: "Inquilinos activos", value: "24", icon: peopleIcon, tone: "success" },
  { label: "Contratos vigentes", value: "18", icon: fileLinesIcon, tone: "info" },
];

function SummaryIcon({ type }) {
  if (type === "x") return <span className="tenant__summary-x" aria-hidden="true">×</span>;
  return <img src={type} alt="" />;
}

function FilterControl({ filter, value, onChange }) {
  return (
    <DropdownSelect
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="tenant__filter"
      triggerClassName="tenant__filter-trigger"
      iconClassName="tenant__filter-icon"
      chevronClassName="tenant__filter-chevron"
    />
  );
}

function TenantRow({ tenant, onEdit }) {
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
        <button className="tenant__actions" type="button" aria-label={`Editar a ${tenant.name}`} onClick={() => onEdit(tenant)}>
          <img src={penIcon} alt="" />
        </button>
      </td>
    </tr>
  );
}

export default function Tenant() {
  const [tenants, setTenants] = useState(initialTenants);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(filters.map(({ options }) => options[0]));
  const [modal, setModal] = useState({ isOpen: false, mode: "create", tenant: null });
  const [notice, setNotice] = useState("");

  const visibleTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchesQuery = !normalizedQuery || [tenant.name, tenant.dni, tenant.email, tenant.address].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesProperty = filterValues[0] === filters[0].options[0] || tenant.address === filterValues[0];
      const matchesStatus = filterValues[1] === filters[1].options[0] || tenant.status === filterValues[1];
      return matchesQuery && matchesProperty && matchesStatus;
    });
  }, [filterValues, query, tenants]);

  function updateFilter(index, value) {
    setFilterValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  function openCreateModal() {
    setModal({ isOpen: true, mode: "create", tenant: null });
  }

  function editTenant(tenant) {
    setModal({ isOpen: true, mode: "edit", tenant });
  }

  function closeTenantModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  function saveTenant(form) {
    const tenantData = {
      name: form.name,
      initials: form.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
      dni: form.dni,
      email: form.email,
      phone: form.phone,
      address: form.address || form.property,
      status: form.status,
    };

    if (modal.mode === "edit") {
      setTenants((current) => current.map((tenant) => (
        tenant === modal.tenant ? { ...tenant, ...tenantData } : tenant
      )));
      setNotice(`Se actualizó la información de ${form.name}.`);
    } else {
      setTenants((current) => [
        ...current,
        {
          ...tenantData,
          unit: "Sin asignar",
          contract: "Sin contrato",
          dates: "Sin contrato",
          due: "—",
        },
      ]);
      setNotice(`Se agregó a ${form.name} a la lista.`);
    }

    window.setTimeout(() => setNotice(""), 2800);
    closeTenantModal();
  }

  return (
    <main id="tenant">
      <div className="tenant__page">
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

        <section className="tenant__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="tenant__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input type="search" placeholder="Buscar contacto..." aria-label="Buscar contacto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {filters.map((filter, index) => <FilterControl key={filter.label} filter={filter} value={filterValues[index]} onChange={(value) => updateFilter(index, value)} />)}
          <Button className="tenant__new-button" onClick={openCreateModal} icon={plusIcon} text="Nuevo inquilino" />
        </section>

        <section className="tenant__table-card" aria-label="Listado de inquilinos">
          <div className="tenant__table-wrap">
            <table>
              <thead><tr><th>Inquilino</th><th>Contacto</th><th>Propiedad</th><th>Contrato</th><th>Estado</th><th>Próximo vencimiento</th><th>Acciones</th></tr></thead>
              <tbody>{visibleTenants.map((tenant, index) => <TenantRow key={`${tenant.name}-${index}`} tenant={tenant} onEdit={editTenant} />)}</tbody>
            </table>
          </div>
          {!visibleTenants.length && <p className="tenant__empty">No encontramos inquilinos con esos criterios.</p>}
        </section>
      </div>

      {notice && <p className="tenant__notice" role="status">{notice}</p>}

      {modal.isOpen && (
        <TenantModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          tenant={modal.tenant}
          onClose={closeTenantModal}
          onSubmit={saveTenant}
        />
      )}
    </main>
  );
}
