import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { houseIcon, locationDotIcon as locationIcon, plusIcon, tagIcon } from "../../assets/icons";
import {
  PropiedadModal,
  ConfirmarEliminacionModal,
  SelectDesplegable,
  Boton,
  TarjetaPropiedadSimple,
  Paginacion,
  usePaginacion,
  PROPERTY_PAGE_SIZE,
} from "../../components";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import "./Propiedades.css";

function FiltroSelect({ filter, value, onChange }) {
  return (
    <SelectDesplegable
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="propiedades__filter"
      triggerClassName="propiedades__filter-trigger"
      iconClassName="propiedades__filter-icon"
      valueClassName="propiedades__filter-label"
      chevronClassName="propiedades__filter-chevron propiedades__icon"
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
      options: ["Todas", ...new Set(properties.map((item) => item.ubicacion).filter(Boolean))],
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
  const searchableText = [property.nombre, property.ubicacion, property.descripcion]
    .join(" ")
    .toLocaleLowerCase("es-AR");

  return (
    (filters.type === "Todos" || property.tipo === filters.type) &&
    (filters.location === "Todas" || property.ubicacion === filters.location) &&
    (filters.status === "Todos" || property.estadoComercial === filters.status) &&
    (!search || searchableText.includes(search))
  );
}

export default function Propiedades() {
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
  const filterItems = buildFilterOptions(catalogs, properties);
  const visibleProperties = properties.filter((property) =>
    matchesFilters(property, filters, search),
  );
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleProperties, PROPERTY_PAGE_SIZE);

  useEffect(() => {
    const onSearch = (event) => {
      setSearch(String(event.detail || "").toLocaleLowerCase("es-AR"));
      setPage(1);
    };
    window.addEventListener("propiedad-search", onSearch);
    return () => window.removeEventListener("propiedad-search", onSearch);
  }, [setPage]);

  useEffect(() => {
    let active = true;

    Promise.all([api.propiedades(), api.catalogosPropiedades()])
      .then(([rows, lists]) => {
        if (!active) return;
        setProperties(rows);
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

  async function openEdit(property) {
    try {
      setModal({ mode: "edit", property: await api.obtenerPropiedad(property.id) });
    } catch (cause) {
      setError(cause.message);
    }
  }

  function save(property, fileError) {
    setProperties((current) => {
      if (modal.mode === "edit") {
        return current.map((item) => (item.id === property.id ? property : item))
      } else {
        return [property, ...current]
      }
    },);
    setModal(null);
    if (fileError)
      setError("La propiedad se guardó, pero hubo un problema con sus archivos: " + fileError);
    else setFeedback(property.nombre + " se guardó correctamente.");
  }

  async function remove() {
    if (!pendingDelete) return;

    try {
      await api.eliminarPropiedad(pendingDelete.id);
      setProperties((current) => current.filter((item) => item.id !== pendingDelete.id));
      setFeedback(pendingDelete.nombre + " se eliminó.");
      setPendingDelete(null);
    } catch (error) {
      setError(error.message);
      setPendingDelete(null);
    }
  }

  if (loading) return <PageSkeleton variant="properties" />;

  return (
    <main id="propiedades">
      <section className="propiedades__top" aria-label="Encabezado y filtros de propiedades">
        <div className="propiedades__intro">
          <h1>Propiedades</h1>
          <p>Gestiona la información de todas las propiedades</p>
        </div>
        <div className="propiedades__toolbar" aria-label="Filtros de propiedades">
          {filterItems.map((filter) => (
            <FiltroSelect
              key={filter.id}
              filter={filter}
              value={filters[filter.id]}
              onChange={(value) => { setFilters((current) => ({ ...current, [filter.id]: value })); resetPage(); }}
            />
          ))}
          <Boton
            className="propiedades__new-button"
            onClick={() => setModal({ mode: "create", property: null })}
            disabled={!catalogs.tipos.length || !catalogs.estados.length}
            icon={plusIcon}
            text="Nueva Propiedad"
          />
        </div>
      </section>

      {error && (
        <p className="propiedades__feedback" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (!catalogs.tipos.length || !catalogs.estados.length) && (
        <p className="propiedades__feedback" role="alert">
          Faltan tipos o estados comerciales en la base de datos para crear propiedades.
        </p>
      )}

      {loading ? (
        <p className="propiedades__empty">Cargando propiedades...</p>
      ) : (
        <section className="propiedades__grid" aria-label="Listado de propiedades">
          {visibleProperties.length ? (
            pageItems.map((property) => (
              <TarjetaPropiedadSimple
                key={property.id}
                property={property}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onOpen={() => navigate("/propiedad/" + property.id)}
              />
            ))
          ) : (
            <p className="propiedades__empty">
              No hay propiedades que coincidan con los filtros seleccionados.
            </p>
          )}
        </section>
      )}
      {!loading && <Paginacion page={page} totalPages={totalPages} total={visibleProperties.length} onPageChange={setPage} pageSize={PROPERTY_PAGE_SIZE} />}

      <p className="propiedades__feedback" role="status">
        {feedback}
      </p>
      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title="¿Seguro que desea eliminar esta propiedad?"
      />
      {modal && (
        <PropiedadModal
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
