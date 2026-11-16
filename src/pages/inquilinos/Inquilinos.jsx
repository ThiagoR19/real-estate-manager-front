import { useEffect, useMemo, useState } from "react";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import {
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
import {
  SelectDesplegable,
  ConfirmarEliminacionModal,
  AccionesEntidad,
  AvisoEnlaceActivacion,
  Boton,
  PildoraResumen,
  Paginacion,
  usePaginacion,
} from "../../components";
import InquilinoModal from "./InquilinoModal";
import propertyImage from "/images.jpg";
import "./Inquilinos.css";
import { api } from "../../services/api.js";

import avatarClass from "../../utils/avatarClass";
import initials from "../../utils/initials.js";

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

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

function formatDate(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
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
    return (
      date >= start &&
      date.getFullYear() === start.getFullYear() &&
      date.getMonth() === start.getMonth()
    );
  }
  return expiresWithin(date, 30, start);
}

function ControlFiltro({ filter, value, onChange }) {
  return (
    <SelectDesplegable
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="inquilinos__filter"
      triggerClassName="inquilinos__filter-trigger"
      iconClassName="inquilinos__filter-icon"
      chevronClassName="inquilinos__filter-chevron"
    />
  );
}

function FilaInquilino({ tenant, onEdit, onDelete, onGenerateActivation }) {
  const name = `${tenant.nombre || ""} ${tenant.apellido || ""}`.trim() || `DNI ${tenant.dni}`;
  const status = !tenant.activo
    ? "Inactivo"
    : tenant.estadoCuenta === "PENDIENTE_ACTIVACION"
      ? "Pendiente"
      : "Activo";
  return (
    <tr>
      <td data-label="Inquilino">
        <div className="inquilinos__person">
          <span className={`inquilinos__avatar ${avatarClass(tenant.nombre, tenant.apellido)}`}>
            {initials(tenant.nombre, tenant.apellido)}
          </span>
          <span className="inquilinos__person-copy">
            <strong>{name}</strong>
            <small>DNI {tenant.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="inquilinos__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            <span className="inquilinos__contact-text" title={tenant.correo || "Correo sin especificar"}>
              {tenant.correo || "Correo sin especificar"}
            </span>
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            <span className="inquilinos__contact-text" title={tenant.telefono || "Teléfono sin especificar"}>
              {tenant.telefono || "Teléfono sin especificar"}
            </span>
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="inquilinos__propiedad">
          <img className="inquilinos__propiedad-image" src={propertyImage} alt="" />
          <span>
            <strong>{tenant.propiedad || "Sin propiedad asignada"}</strong>
            <small>{tenant.propiedadUbicacion || "Sin ubicación de propiedad"}</small>
          </span>
        </div>
      </td>
      <td data-label="Contrato">
        <span className="inquilinos__contract">
          <strong>{tenant.idContrato ? `Contrato #${tenant.idContrato}` : "Sin contrato"}</strong>
          <small>
            {tenant.idContrato
              ? `${formatDate(tenant.fechaInicio)} – ${formatDate(tenant.fechaFin)}`
              : "Sin contrato vigente"}
          </small>
        </span>
      </td>
      <td data-label="Estado">
        <span
          className={`inquilinos__status inquilinos__status--${status === "Activo" ? "active" : status === "Inactivo" ? "inactive" : "pending"}`}
        >
          {status}
        </span>
      </td>
      <td data-label="Próximo vencimiento">
        <strong className="inquilinos__due">
          {tenant.estadoContrato === "Vigente" ? formatDate(tenant.fechaFin) : "—"}
        </strong>
      </td>
      <td data-label="Acciones" className="inquilinos__actions-cell">
        <AccionesEntidad
          entity="inquilino"
          name={name}
          onEdit={() => onEdit(tenant)}
          onDelete={() => onDelete(tenant)}
          onGenerateActivation={
            tenant.estadoCuenta === "PENDIENTE_ACTIVACION"
              ? () => onGenerateActivation(tenant)
              : undefined
          }
        />
      </td>
    </tr>
  );
}

export default function Inquilinos() {
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
        const rows = await api.inquilinos();
        if (mounted) setTenants(rows);
      } catch (error) {
        if (mounted) setLoadError(error.message || "No se pudieron cargar los inquilinos.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTenants();
    return () => {
      mounted = false;
    };
  }, []);

  const filterControls = useMemo(() => {
    const propertyOptions = [
      ...new Set(tenants.map((tenant) => tenant.propiedad).filter(Boolean)),
    ].sort((first, second) => first.localeCompare(second, "es"));
    return [
      { ...filterDefinitions[0], options: [filterDefinitions[0].all, ...propertyOptions] },
      { ...filterDefinitions[1], options: statusOptions },
      { ...filterDefinitions[2], options: dueDateOptions },
    ];
  }, [tenants]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Inquilinos activos",
        value: tenants.filter(
          (tenant) => tenant.activo && tenant.estadoCuenta !== "PENDIENTE_ACTIVACION",
        ).length,
        icon: peopleIcon,
        tone: "success",
      },
      {
        label: "Pendientes",
        value: tenants.filter(
          (tenant) => tenant.activo && tenant.estadoCuenta === "PENDIENTE_ACTIVACION",
        ).length,
        icon: clockIcon,
        tone: "warning",
      },
      {
        label: "Contratos vigentes",
        value: tenants.filter((tenant) => tenant.estadoContrato === "Vigente").length,
        icon: fileIcon,
        tone: "info",
      },
      {
        label: "Vencen en 30 días",
        value: tenants.filter(
          (tenant) => tenant.estadoContrato === "Vigente" && expiresWithin(tenant.fechaFin, 30),
        ).length,
        icon: calendarIcon,
        tone: "danger",
      },
    ],
    [tenants],
  );

  const visibleTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    const today = new Date();
    return tenants.filter((tenant) => {
      const searchable = [
        tenant.nombre,
        tenant.apellido,
        tenant.dni,
        tenant.correo,
        tenant.telefono,
        tenant.direccion,
        tenant.propiedad,
        tenant.propiedadUbicacion,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery),
      );
      const matchesQuery = !normalizedQuery || searchable;
      const matchesProperty =
        filterValues[0] === filterDefinitions[0].all || tenant.propiedad === filterValues[0];
      const status = !tenant.activo
        ? "Inactivo"
        : tenant.estadoCuenta === "PENDIENTE_ACTIVACION"
          ? "Pendiente"
          : "Activo";
      const matchesStatus = filterValues[1] === statusOptions[0] || status === filterValues[1];
      const matchesDate = matchesDueDate(tenant, filterValues[2], today);
      return matchesQuery && matchesProperty && matchesStatus && matchesDate;
    });
  }, [filterValues, query, tenants]);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleTenants);

  async function confirmDeleteTenant() {
    if (!pendingDelete) return;
    setActionError("");
    try {
      await api.eliminarInquilino(pendingDelete.id);
      setTenants((current) => current.filter((tenant) => tenant.id !== pendingDelete.id));
      setNotice(`${`${pendingDelete.nombre || ""} ${pendingDelete.apellido || ""}`.trim() || `DNI ${pendingDelete.dni}`} fue eliminado.`);
      setActivationUrl("");
      window.setTimeout(() => setNotice(""), 2800);
    } catch (error) {
      setActionError(error.message || "No se pudo eliminar el inquilino.");
    } finally {
      setPendingDelete(null);
    }
  }

  async function generateActivation(tenant) {
    setActionError("");
    try {
      const activacion = await api.generarEnlaceInquilino(tenant.id);
      const titular = `${tenant.nombre || ""} ${tenant.apellido || ""}`.trim() || `DNI ${tenant.dni}`;
      setActivationUrl(enlaceActivacion(activacion));
      setNotice(`Enlace nuevo para ${titular}. Compartilo con el inquilino para activar su cuenta.`);
    } catch (error) {
      setActionError(error.message || "No se pudo generar el enlace de activación.");
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
      nombre: form.firstName || null,
      apellido: form.lastName || null,
      dni: form.dni || null,
      correo: form.email || null,
      telefono: form.phone || null,
      direccion: form.address || null,
    };
    const raw = existing
      ? await api.actualizarInquilino(existing.id, { ...body, dni: undefined, activo: form.active })
      : await api.crearInquilino(body);
    const result = { tenant: raw, activationUrl: enlaceActivacion(raw.activacion) };
    setTenants((current) =>
      existing
        ? current.map((tenant) => (tenant.id === existing.id ? result.tenant : tenant))
        : [result.tenant, ...current],
    );
    const titular = `${raw.nombre || ""} ${raw.apellido || ""}`.trim() || `DNI ${raw.dni}`;
    setNotice(existing ? `Se actualizó la información de ${titular}.` : `Se creó el acceso de ${titular}. Compartí el enlace con su titular.`);
    setActivationUrl(result.activationUrl || "");
    if (!result.activationUrl) window.setTimeout(() => setNotice(""), 2800);
    closeTenantModal();
  }

  function updateFilter(index, value) {
    resetPage();
    setFilterValues((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  if (loading) return <PageSkeleton variant="table" title="inquilinos" />;

  return (
    <main id="inquilinos">
      <div className="inquilinos__page">
        <section className="inquilinos__overview" aria-labelledby="inquilinos-title">
          <div className="inquilinos__hero">
            <h1 id="inquilinos-title">Inquilinos</h1>
            <p>Gestiona la información de todos los inquilinos</p>
          </div>
          <div className="inquilinos__summary" aria-label="Resumen de inquilinos">
            {summaryCards.map((card) => (
              <PildoraResumen key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="inquilinos__toolbar" aria-label="Buscar y filtrar inquilinos">
          <label className="inquilinos__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
            />
          </label>
          {filterControls.map((filter, index) => (
            <ControlFiltro
              key={filter.label}
              filter={filter}
              value={filterValues[index] || filter.options[0]}
              onChange={(value) => updateFilter(index, value)}
            />
          ))}
          <Boton
            className="inquilinos__new-button"
            onClick={openCreateModal}
            icon={plusIcon}
            text="Nuevo inquilino"
          />
        </section>

        <section className="inquilinos__table-card" aria-label="Listado de inquilinos">
          <div className="inquilinos__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Contacto</th>
                  <th>Propiedad</th>
                  <th>Contrato</th>
                  <th>Estado</th>
                  <th>Próximo vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((tenant) => (
                  <FilaInquilino
                    key={tenant.id}
                    tenant={tenant}
                    onEdit={editTenant}
                    onDelete={setPendingDelete}
                    onGenerateActivation={generateActivation}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p className="inquilinos__empty">Cargando inquilinos...</p>}
          {!loading && loadError && (
            <p className="inquilinos__empty" role="alert">
              {loadError}
            </p>
          )}
          {!loading && !loadError && !visibleTenants.length && (
            <p className="inquilinos__empty">No encontramos inquilinos con esos criterios.</p>
          )}
          <Paginacion page={page} totalPages={totalPages} total={visibleTenants.length} onPageChange={setPage} />
        </section>
      </div>

      {actionError && (
        <p className="inquilinos__notice" role="alert">
          {actionError}
        </p>
      )}
      {notice && (
        <AvisoEnlaceActivacion
          message={notice}
          url={activationUrl}
          onDismiss={() => { setNotice(""); setActivationUrl(""); }}
        />
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDeleteTenant}
        title="¿Seguro que desea eliminar este inquilino?"
      />

      {modal.isOpen && (
        <InquilinoModal
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
