import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { houseIcon, locationDotIcon, plusIcon, tagIcon } from "../../assets/icons";
import { PropiedadModal, ConfirmarEliminacionModal, SelectDesplegable, Boton, TarjetaPropiedadSimple, Paginacion, usePaginacion, PROPERTY_PAGE_SIZE, mostrarAviso } from "../../components";
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

function crearOpcionesFiltro(catalogos, propiedades) {
  return [
    {
      id: "type",
      label: "Tipo",
      icon: houseIcon,
      options: ["Todos", ...catalogos.tipos.map((item) => item.nombre)],
    },
    {
      id: "location",
      label: "Ubicación",
      icon: locationDotIcon,
      options: ["Todas", ...new Set(propiedades.map((item) => item.ubicacion).filter(Boolean))],
    },
    {
      id: "status",
      label: "Estado",
      icon: tagIcon,
      options: ["Todos", ...catalogos.estados.map((item) => item.nombre)],
    },
  ];
}

function coincideConFiltros(propiedad, filtros, busqueda) {
  const textoBuscable = [propiedad.nombre, propiedad.ubicacion, propiedad.descripcion]
    .join(" ")
    .toLocaleLowerCase("es-AR");

  return (
    (filtros.type === "Todos" || propiedad.tipo === filtros.type) &&
    (filtros.location === "Todas" || propiedad.ubicacion === filtros.location) &&
    (filtros.status === "Todos" || propiedad.estadoComercial === filtros.status) &&
    (!busqueda || textoBuscable.includes(busqueda))
  );
}

export default function Propiedades() {
  const [, navigate] = useLocation();
  const [propiedades, setPropiedades] = useState([]);
  const [catalogos, setCatalogos] = useState({ tipos: [], estados: [], agentes: [] });
  const [filtros, setFiltros] = useState({ type: "Todos", status: "Todos", location: "Todas" });
  const [modal, setModal] = useState(null);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const opcionesFiltros = crearOpcionesFiltro(catalogos, propiedades);
  const propiedadesVisibles = propiedades.filter((propiedad) =>
    coincideConFiltros(propiedad, filtros, busqueda),
  );
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(propiedadesVisibles, PROPERTY_PAGE_SIZE);

  useEffect(() => {
    const onSearch = (event) => {
      setBusqueda(String(event.detail || "").toLocaleLowerCase("es-AR"));
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
        setPropiedades(rows);
        setCatalogos(lists);
      })
      .catch((cause) => {
        if (active) {
          setError(cause.message);
          mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar las propiedades", mensaje: cause.message });
        }
      })
      .finally(() => {
        if (active) setCargando(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cargando && !error && (!catalogos.tipos.length || !catalogos.estados.length)) {
      mostrarAviso({
        tipo: "advertencia",
        titulo: "Faltan datos para crear propiedades",
        mensaje: "La base de datos necesita tipos y estados comerciales configurados.",
      });
    }
  }, [catalogos.estados.length, catalogos.tipos.length, error, cargando]);

  async function abrirEdicion(propiedad) {
    try {
      setModal({ mode: "edit", propiedad: await api.obtenerPropiedad(propiedad.id) });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo abrir la propiedad", mensaje: cause.message });
    }
  }

  function guardarPropiedad(propiedad, errorArchivos) {
    setPropiedades((current) => {
      if (modal.mode === "edit") {
        return current.map((item) => (item.id === propiedad.id ? propiedad : item))
      } else {
        return [propiedad, ...current]
      }
    },);
    setModal(null);
    if (errorArchivos) {
      const mensaje = `La propiedad se guardó, pero hubo un problema con sus archivos: ${errorArchivos}`;
      mostrarAviso({ tipo: "advertencia", titulo: "Propiedad guardada con observaciones", mensaje });
    } else {
      mostrarAviso({ tipo: "exito", titulo: "Propiedad guardada", mensaje: `${propiedad.nombre} se guardó correctamente.` });
    }
  }

  async function eliminarPropiedad() {
    if (!pendienteEliminar) return;

    try {
      await api.eliminarPropiedad(pendienteEliminar.id);
      setPropiedades((current) => current.filter((item) => item.id !== pendienteEliminar.id));
      mostrarAviso({ tipo: "exito", titulo: "Propiedad eliminada", mensaje: `${pendienteEliminar.nombre} se eliminó.` });
      setPendienteEliminar(null);
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar la propiedad", mensaje: error.message });
      setPendienteEliminar(null);
    }
  }

  if (cargando) return <PageSkeleton variant="properties" />;

  return (
    <main id="propiedades">
      <section className="propiedades__top" aria-label="Encabezado y filtros de propiedades">
        <div className="propiedades__intro">
          <h1>Propiedades</h1>
          <p>Gestiona la información de todas las propiedades</p>
        </div>
        <div className="propiedades__toolbar" aria-label="Filtros de propiedades">
          {opcionesFiltros.map((filter) => (
            <FiltroSelect
              key={filter.id}
              filter={filter}
              value={filtros[filter.id]}
              onChange={(value) => { setFiltros((current) => ({ ...current, [filter.id]: value })); resetPage(); }}
            />
          ))}
          <Boton
            className="propiedades__new-button"
            onClick={() => setModal({ mode: "create", propiedad: null })}
            disabled={!catalogos.tipos.length || !catalogos.estados.length}
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
      {!error && (!catalogos.tipos.length || !catalogos.estados.length) && (
        <p className="propiedades__feedback" role="alert">
          Faltan tipos o estados comerciales en la base de datos para crear propiedades.
        </p>
      )}

      <section className="propiedades__grid" aria-label="Listado de propiedades">
        {propiedadesVisibles.length ? (
          pageItems.map((propiedad) => (
            <TarjetaPropiedadSimple
              key={propiedad.id}
              propiedad={propiedad}
              onEdit={abrirEdicion}
              onDelete={setPendienteEliminar}
              onOpen={() => navigate("/propiedad/" + propiedad.id)}
            />
          ))
        ) : (
          <p className="propiedades__empty">
            No hay propiedades que coincidan con los filtros seleccionados.
          </p>
        )}
      </section>

      <Paginacion page={page} totalPages={totalPages} total={propiedadesVisibles.length} onPageChange={setPage} pageSize={PROPERTY_PAGE_SIZE} mostrarTamanoPagina />

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        onClose={() => setPendienteEliminar(null)}
        onConfirm={eliminarPropiedad}
        title="¿Seguro que desea eliminar esta propiedad?"
      />
      {modal && (
        <PropiedadModal
          isOpen
          mode={modal.mode}
          propiedad={modal.propiedad}
          catalogos={catalogos}
          onClose={() => setModal(null)}
          onSubmit={guardarPropiedad}
        />
      )}
    </main>
  );
}
