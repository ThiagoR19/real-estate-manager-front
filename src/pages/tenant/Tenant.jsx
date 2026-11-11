import { useEffect, useMemo, useState } from "react";
import { calendarIcon, clockIcon, envelopeIcon, fileLinesIcon as fileIcon, houseIcon, locationDotIcon as locationIcon, magnifyingGlassIcon, peopleIcon, phoneIcon, plusIcon } from "../../assets/icons";
import { DropdownSelect, TenantModal, ConfirmDeleteModal, EntityActions, Button, SummaryPill } from "../../components";
import propertyImage from "/images.jpg";
import "./Tenant.css";
import { api } from "../../services/api.js";

import avatarClass from '../../utils/avatarClass'
import initials from '../../utils/initials.js'

const filterDefinitions = [
  { label: "Propiedad", icon: houseIcon, all: "Todas las propiedades" },
  { label: "Estado", icon: locationIcon, all: "Todos los estados" },
  { label: "Vencimiento", icon: calendarIcon, all: "Todos los vencimientos" },
];

const statusOptions = ["Todos los estados", "Activo", "Inactivo", "Pendiente"];
const dueDateOptions = ["Todos los vencimientos", "Este mes", "Próximos 30 días"];

function parseDate(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function expiresWithin(value, days, today = new Date()) {
  const date = parseDate(value);
  if (!date) return false;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return date >= start && date <= end;
}

function matchesDueDate(tenant, selected, today) {
  if (selected === dueDateOptions[0]) return true;
  if (tenant.estadoContrato !== "Vigente") return false;
  const date = parseDate(tenant.fechaFin);
  if (!date) return false;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (selected === dueDateOptions[1]) {
    return date >= start && date.getFullYear() === start.getFullYear() && date.getMonth() === start.getMonth();
  }
  return expiresWithin(date, 30, start);
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

function TenantRow({ tenant, onEdit, onDelete }) {
  const name = `${tenant.nombre} ${tenant.apellido}`;
  const status = !tenant.activo ? "Inactivo" : tenant.estadoCuenta === "PENDIENTE_ACTIVACION" ? "Pendiente" : "Activo";
  return (
    <tr>
      <td data-label="Inquilino">
        <div className="tenant__person">
          <span className={`tenant__avatar ${avatarClass(tenant.nombre, tenant.apellido)}`}>{initials(tenant.nombre, tenant.apellido)}</span>
          <span className="tenant__person-copy"><strong>{name}</strong><small>DNI {tenant.dni || "—"}</small></span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="tenant__contact">
          <span><img src={envelopeIcon} alt="" />{tenant.correo || "Correo sin especificar"}</span>
          <span><img src={phoneIcon} alt="" />{tenant.telefono || "Teléfono sin especificar"}</span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="tenant__property">
          <img className="tenant__property-image" src={propertyImage} alt="" />
          <span><strong>{tenant.propiedad || "Sin propiedad asignada"}</strong><small>{tenant.propiedadUbicacion || "Sin ubicación de propiedad"}</small></span>
        </div>
      </td>
      <td data-label="Contrato">
        <span className="tenant__contract">
          <strong>{tenant.idContrato ? `Contrato #${tenant.idContrato}` : "Sin contrato"}</strong>
          <small>{tenant.idContrato ? `${formatDate(tenant.fechaInicio)} – ${formatDate(tenant.fechaFin)}` : "Sin contrato vigente"}</small>
        </span>
      </td>
      <td data-label="Estado"><span className={`tenant__status tenant__status--${status === "Activo" ? "active" : status === "Inactivo" ? "inactive" : "pending"}`}>{status}</span></td>
      <td data-label="Próximo vencimiento"><strong className="tenant__due">{tenant.estadoContrato === "Vigente" ? formatDate(tenant.fechaFin) : "—"}</strong></td>
      <td data-label="Acciones" className="tenant__actions-cell">
        <EntityActions
          entity="inquilino"
          name={name}
          onEdit={() => onEdit(tenant)}
          onDelete={() => onDelete(tenant)}
        />
      </td>
    </tr>
  );
}

export default function Tenant() {
  const [tenants, setTenants] = useState([]);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(filterDefinitions.map((filter) => filter.all));
  const [modal, setModal] = useState({ isOpen: false, mode: "create", tenant: null });
  const [notice, setNotice] = useState("");
  const [activationUrl, setActivationUrl] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadTenants() {
      setLoading(true);
      setLoadError("");
      try {
        const rows = await api.tenants();
        if (mounted) setTenants(rows);
      } catch (error) {
        if (mounted) setLoadError(error.message || "No se pudieron cargar los inquilinos.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTenants();
    return () => { mounted = false; };
  }, []);

  const filterControls = useMemo(() => {
    const propertyOptions = [...new Set(tenants.map((tenant) => tenant.propiedad).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, "es"));
    return [
      { ...filterDefinitions[0], options: [filterDefinitions[0].all, ...propertyOptions] },
      { ...filterDefinitions[1], options: statusOptions },
      { ...filterDefinitions[2], options: dueDateOptions },
    ];
  }, [tenants]);

  const summaryCards = useMemo(() => [
    { label: "Inquilinos activos", value: tenants.filter((tenant) => tenant.activo && tenant.estadoCuenta !== "PENDIENTE_ACTIVACION").length, icon: peopleIcon, tone: "success" },
    { label: "Pendientes", value: tenants.filter((tenant) => tenant.activo && tenant.estadoCuenta === "PENDIENTE_ACTIVACION").length, icon: clockIcon, tone: "warning" },
    { label: "Contratos vigentes", value: tenants.filter((tenant) => tenant.estadoContrato === "Vigente").length, icon: fileIcon, tone: "info" },
    { label: "Vencen en 30 días", value: tenants.filter((tenant) => tenant.estadoContrato === "Vigente" && expiresWithin(tenant.fechaFin, 30)).length, icon: calendarIcon, tone: "danger" },
  ], [tenants]);

  const visibleTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    const today = new Date();
    return tenants.filter((tenant) => {
      const searchable = [tenant.nombre, tenant.apellido, tenant.dni, tenant.correo, tenant.telefono, tenant.direccion, tenant.propiedad, tenant.propiedadUbicacion]
        .some((value) => String(value ?? "").toLocaleLowerCase("es").includes(normalizedQuery));
      const matchesQuery = !normalizedQuery || searchable;
      const matchesProperty = filterValues[0] === filterDefinitions[0].all || tenant.propiedad === filterValues[0];
      const status = !tenant.activo ? "Inactivo" : tenant.estadoCuenta === "PENDIENTE_ACTIVACION" ? "Pendiente" : "Activo";
      const matchesStatus = filterValues[1] === statusOptions[0] || status === filterValues[1];
      const matchesDate = matchesDueDate(tenant, filterValues[2], today);
      return matchesQuery && matchesProperty && matchesStatus && matchesDate;
    });
  }, [filterValues, query, tenants]);

  async function confirmDeleteTenant() {
    if (!pendingDelete) return;
    setActionError("");
    try {
      await api.deleteTenant(pendingDelete.id);
      setTenants((current) => current.filter((tenant) => tenant.id !== pendingDelete.id));
      setNotice(`${pendingDelete.nombre} ${pendingDelete.apellido} fue eliminado.`);
      setActivationUrl("");
      window.setTimeout(() => setNotice(""), 2800);
    } catch (error) {
      setActionError(error.message || "No se pudo eliminar el inquilino.");
    } finally {
      setPendingDelete(null);
    }
  }

  function openCreateModal() {
    setActionError("");
    setModal({ isOpen: true, mode: "create", tenant: null });
  }

  function editTenant(tenant) {
    setActionError("");
    setModal({ isOpen: true, mode: "edit", tenant });
  }

  function closeTenantModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  async function saveTenant(form) {
    setActionError("");
    const existing = modal.mode === "edit" ? modal.tenant : null;
    const body = {
      nombre: form.firstName,
      apellido: form.lastName,
      dni: form.dni || null,
      correo: form.email || null,
      telefono: form.phone || null,
      direccion: form.address || null,
    };
    const raw = existing
      ? await api.updateTenant(existing.id, { ...body, activo: form.active })
      : await api.createTenant({ ...body, usuario: form.email, password: crypto.randomUUID() });
    const result = { tenant: raw, activationUrl: raw.activacion?.enlace };
    setTenants((current) => existing
      ? current.map((tenant) => tenant.id === existing.id ? result.tenant : tenant)
      : [result.tenant, ...current]);
    setNotice(existing ? `Se actualizó la información de ${raw.nombre} ${raw.apellido}.` : `Se creó el acceso de ${raw.nombre} ${raw.apellido}.`);
    setActivationUrl(result.activationUrl || "");
    if (!result.activationUrl) window.setTimeout(() => setNotice(""), 2800);
    closeTenantModal();
  }

  function updateFilter(index, value) {
    setFilterValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  return (
    <main id="tenant">
      <div className="tenant__page">
        <section className="tenant__overview" aria-labelledby="tenant-title">
          <div className="tenant__hero">
            <h1 id="tenant-title">Inquilinos</h1>
            <p>Gestiona la información de todos los inquilinos</p>
          </div>
          <div className="tenant__summary" aria-label="Resumen de inquilinos">
            {summaryCards.map((card) => (
              <SummaryPill key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="tenant__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="tenant__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input type="search" placeholder="Buscar contacto..." aria-label="Buscar contacto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {filterControls.map((filter, index) => <FilterControl key={filter.label} filter={filter} value={filterValues[index] || filter.options[0]} onChange={(value) => updateFilter(index, value)} />)}
          <Button className="tenant__new-button" onClick={openCreateModal} icon={plusIcon} text="Nuevo inquilino" />
        </section>

        <section className="tenant__table-card" aria-label="Listado de inquilinos">
          <div className="tenant__table-wrap">
            <table>
              <thead><tr><th>Inquilino</th><th>Contacto</th><th>Propiedad</th><th>Contrato</th><th>Estado</th><th>Próximo vencimiento</th><th>Acciones</th></tr></thead>
              <tbody>{visibleTenants.map((tenant) => <TenantRow key={tenant.id} tenant={tenant} onEdit={editTenant} onDelete={setPendingDelete} />)}</tbody>
            </table>
          </div>
          {loading && <p className="tenant__empty">Cargando inquilinos...</p>}
          {!loading && loadError && <p className="tenant__empty" role="alert">{loadError}</p>}
          {!loading && !loadError && !visibleTenants.length && <p className="tenant__empty">No encontramos inquilinos con esos criterios.</p>}
        </section>
      </div>

      {actionError && <p className="tenant__notice" role="alert">{actionError}</p>}
      {notice && <p className="tenant__notice" role="status">
        {notice}
        {activationUrl && <> <a href={activationUrl}>Abrir enlace de activación</a></>}
      </p>}

      <ConfirmDeleteModal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={confirmDeleteTenant} title="¿Seguro que desea eliminar este inquilino?" />

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
