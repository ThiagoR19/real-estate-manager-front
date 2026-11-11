import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { houseIcon, locationDotIcon as locationIcon, plusIcon, tagIcon } from "../../assets/icons";
import { PropertyModal, ConfirmDeleteModal, DropdownSelect, Button, PropertyCardSimple } from "../../components";
import { api } from "../../services/api.js";
import { toProperty } from "../../services/properties.js";
import "./Properties.css";

function FilterSelect({ filter, value, onChange }) {
  return (
    <DropdownSelect
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="properties__filter"
      triggerClassName="properties__filter-trigger"
      iconClassName="properties__filter-icon"
      valueClassName="properties__filter-label"
      chevronClassName="properties__filter-chevron properties__icon"
    />
  );
}

function buildFilterOptions(catalogs, properties) {
  return [
    {
      id: "type",
      label: "Tipo",
      icon: houseIcon,
      options: ["Todos", ...catalogs.tipos.map((item) => item.nombre)],
    },
    {
      id: "location",
      label: "Ubicación",
      icon: locationIcon,
      options: ["Todas", ...new Set(properties.map((item) => item.location))],
    },
    {
      id: "status",
      label: "Estado",
      icon: tagIcon,
      options: ["Todos", ...catalogs.estados.map((item) => item.nombre)],
    },
  ];
}

function matchesFilters(property, filters, search) {
  const searchableText = [property.name, property.location, property.description].join(" ").toLocaleLowerCase("es-AR");

  return (
    (filters.type === "Todos" || property.type === filters.type)
    && (filters.location === "Todas" || property.location === filters.location)
    && (filters.status === "Todos" || property.status === filters.status)
    && (!search || searchableText.includes(search))
  );
}

export default function Properties() {
  const [, navigate] = useLocation();
  const [properties, setProperties] = useState([]);
  const [catalogs, setCatalogs] = useState({ tipos: [], estados: [], agentes: [] });
  const [filters, setFilters] = useState({ type: "Todos", status: "Todos", location: "Todas" });
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onSearch = (event) => {
      setSearch(String(event.detail || "").toLocaleLowerCase("es-AR"));
    };
    window.addEventListener("property-search", onSearch);
    return () => window.removeEventListener("property-search", onSearch);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([api.properties(), api.propertyCatalogs()])
      .then(([rows, lists]) => {
        if (!active) return;
        setProperties(rows.map((row) => toProperty(row)));
        setCatalogs(lists);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshProperties() {
    const rows = await api.properties();
    setProperties(rows.map((row) => toProperty(row)));
  }

  async function openEdit(property) {
    try {
      setModal({ mode: "edit", property: await api.getProperty(property.id) });
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function save(form) {
    try {
      const property = await api.persistProperty(form, modal.property);
      await refreshProperties();
      setModal(null);
      setFeedback(property.name + " se guardó correctamente.");
    } catch (cause) {
      if (cause.propertyId) {
        await refreshProperties();
        setModal(null);
        setError("La propiedad se guardó, pero hubo un problema con sus archivos: " + cause.message);
        return;
      }
      throw cause;
    }
  }

  async function remove() {
    if (!pendingDelete) return;

    try {
      await api.deleteProperty(pendingDelete.id);
      setProperties((current) => current.filter((item) => item.id !== pendingDelete.id));
      setFeedback(pendingDelete.name + " se eliminó.");
      setPendingDelete(null);
    } catch (cause) {
      setError(cause.message);
      setPendingDelete(null);
    }
  }

  const filterItems = buildFilterOptions(catalogs, properties);
  const visibleProperties = properties.filter((property) => matchesFilters(property, filters, search));

  return (
    <main id="properties">
      <section className="properties__top" aria-label="Encabezado y filtros de propiedades">
        <div className="properties__intro">
          <h1>Propiedades</h1>
          <p>Gestiona la información de todas las propiedades</p>
        </div>
        <div className="properties__toolbar" aria-label="Filtros de propiedades">
          {filterItems.map((filter) => (
            <FilterSelect
              key={filter.id}
              filter={filter}
              value={filters[filter.id]}
              onChange={(value) => setFilters((current) => ({ ...current, [filter.id]: value }))}
            />
          ))}
          <Button
            className="properties__new-button"
            onClick={() => setModal({ mode: "create", property: null })}
            disabled={!catalogs.tipos.length || !catalogs.estados.length}
            icon={plusIcon}
            text="Nueva Propiedad"
          />
        </div>
      </section>

      {error && <p className="properties__feedback" role="alert">{error}</p>}
      {!loading && !error && (!catalogs.tipos.length || !catalogs.estados.length) && (
        <p className="properties__feedback" role="alert">
          Faltan tipos o estados comerciales en la base de datos para crear propiedades.
        </p>
      )}

      {loading ? (
        <p className="properties__empty">Cargando propiedades...</p>
      ) : (
        <section className="properties__grid" aria-label="Listado de propiedades">
          {visibleProperties.length ? (
            visibleProperties.map((property) => (
              <PropertyCardSimple
                key={property.id}
                property={property}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onOpen={() => navigate("/property/" + property.id)}
              />
            ))
          ) : (
            <p className="properties__empty">
              No hay propiedades que coincidan con los filtros seleccionados.
            </p>
          )}
        </section>
      )}

      <p className="properties__feedback" role="status">{feedback}</p>
      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title="¿Seguro que desea eliminar esta propiedad?"
      />
      {modal && (
        <PropertyModal
          isOpen
          mode={modal.mode}
          property={modal.property}
          catalogs={catalogs}
          onClose={() => setModal(null)}
          onSubmit={save}
        />
      )}
    </main>
  );
}
