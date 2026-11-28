import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { houseIcon, locationDotIcon, plusIcon, tagIcon } from "../../assets/icons";
import { PropiedadModal, ConfirmarEliminacionModal, Boton, FiltroListado, TarjetaPropiedadSimple, Paginacion, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import usePropiedadesPaginadas from "../../hooks/usePropiedadesPaginadas.js";
import "./Propiedades.css";

export default function Propiedades() {
  const [, navegar] = useLocation();
  const [catalogos, setCatalogos] = useState({ tipos: [], estados: [], agentes: [], ubicaciones: [] });
  const [filtros, setFiltros] = useState({});
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState("");
  const [revisionCatalogos, setRevisionCatalogos] = useState(0);
  const [modal, setModal] = useState(null);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const { propiedades, paginacion, error, cargando, cambiarBusqueda, cambiarPagina, recargar: recargarListado } = usePropiedadesPaginadas(filtros);
  const opcionesTipo = catalogos.tipos.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));
  const opcionesEstado = catalogos.estados.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));
  const opcionesUbicacion = (catalogos.ubicaciones ?? []).map((ubicacion) => ({ valor: ubicacion, etiqueta: ubicacion }));

  function recargar() {
    recargarListado();
    setRevisionCatalogos((actual) => actual + 1);
  }

  function cambiarFiltro(nombre, valor) {
    setFiltros((actuales) => ({ ...actuales, [nombre]: valor }));
  }

  useEffect(() => {
    const buscar = (evento) => cambiarBusqueda(evento.detail || "");
    window.addEventListener("propiedad-search", buscar);
    return () => window.removeEventListener("propiedad-search", buscar);
  }, [cambiarBusqueda]);

  useEffect(() => {
    let activa = true;
    api.catalogosPropiedades()
      .then((resultado) => {
        if (activa) {
          setCatalogos(resultado);
          setErrorCatalogos("");
        }
      })
      .catch((error) => { if (activa) setErrorCatalogos(error.message); })
      .finally(() => { if (activa) setCargandoCatalogos(false); });
    return () => { activa = false; };
  }, [revisionCatalogos]);

  async function abrirEdicion(propiedad) {
    try {
      setModal({ mode: "edit", propiedad: await api.obtenerPropiedad(propiedad.id) });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo abrir la propiedad", mensaje: error.message });
    }
  }

  function guardarPropiedad(propiedad, errorArchivos) {
    setModal(null);
    recargar();
    if (errorArchivos) {
      mostrarAviso({ tipo: "advertencia", titulo: "Propiedad guardada con observaciones", mensaje: `La propiedad se guardó, pero hubo un problema con sus archivos: ${errorArchivos}` });
    } else {
      mostrarAviso({ tipo: "exito", titulo: "Propiedad guardada", mensaje: `${propiedad.nombre} se guardó correctamente.` });
    }
  }

  async function eliminarPropiedad() {
    if (!pendienteEliminar || eliminando) return;
    setEliminando(true);
    try {
      await api.eliminarPropiedad(pendienteEliminar.id);
      recargar();
      mostrarAviso({ tipo: "exito", titulo: "Propiedad eliminada", mensaje: `${pendienteEliminar.nombre} se eliminó.` });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar la propiedad", mensaje: error.message });
    } finally {
      setPendienteEliminar(null);
      setEliminando(false);
    }
  }

  const puedeCrear = !cargandoCatalogos && !errorCatalogos && catalogos.tipos.length > 0 && catalogos.estados.length > 0;

  return (
    <main id="propiedades">
      <section className="propiedades__top" aria-label="Encabezado y filtros de propiedades">
        <div className="propiedades__intro">
          <h1>Propiedades</h1>
          <p>Gestiona la información de todas las propiedades</p>
        </div>
        <div className="propiedades__toolbar" aria-label="Filtros de propiedades">
          <FiltroListado etiqueta="Tipo" todos="Todos" opciones={opcionesTipo} icono={houseIcon} prefijo="propiedades"
            valueClassName="propiedades__filter-label" chevronClassName="propiedades__filter-chevron propiedades__icon"
            valor={filtros.idTipo} alCambiar={(valor) => cambiarFiltro("idTipo", valor)} />
          <FiltroListado etiqueta="Ubicación" todos="Todas" opciones={opcionesUbicacion} icono={locationDotIcon} prefijo="propiedades"
            valueClassName="propiedades__filter-label" chevronClassName="propiedades__filter-chevron propiedades__icon"
            valor={filtros.ubicacion} alCambiar={(valor) => cambiarFiltro("ubicacion", valor)} />
          <FiltroListado etiqueta="Estado" todos="Todos" opciones={opcionesEstado} icono={tagIcon} prefijo="propiedades"
            valueClassName="propiedades__filter-label" chevronClassName="propiedades__filter-chevron propiedades__icon"
            valor={filtros.idEstadoComercial} alCambiar={(valor) => cambiarFiltro("idEstadoComercial", valor)} />
          <Boton className="propiedades__new-button" onClick={() => setModal({ mode: "create", propiedad: null })}
            disabled={!puedeCrear} icon={plusIcon} text="Nueva Propiedad" />
        </div>
      </section>

      {errorCatalogos && (
        <p className="propiedades__nota" role="alert">
          No se pudieron cargar los datos del formulario: {errorCatalogos}{" "}
          <button type="button" onClick={() => { setCargandoCatalogos(true); setRevisionCatalogos((actual) => actual + 1); }}>Reintentar</button>
        </p>
      )}
      {!cargandoCatalogos && !errorCatalogos && !puedeCrear && (
        <p className="propiedades__nota" role="alert">Faltan tipos o estados comerciales para crear propiedades.</p>
      )}

      <section className="propiedades__grid" aria-label="Listado de propiedades" aria-busy={cargando}>
        {cargando ? <p className="propiedades__empty" role="status">Cargando propiedades...</p> : error ? (
          <div className="propiedades__empty" role="alert">
            <p>{error}</p>
            <button type="button" onClick={recargar}>Reintentar</button>
          </div>
        ) : propiedades.length ? propiedades.map((propiedad) => (
          <TarjetaPropiedadSimple key={propiedad.id} propiedad={propiedad} onEdit={abrirEdicion}
            onDelete={setPendienteEliminar} onOpen={() => navegar("/propiedad/" + propiedad.id)} />
        )) : <p className="propiedades__empty">No hay propiedades que coincidan con la búsqueda.</p>}
      </section>

      {paginacion && <Paginacion page={paginacion.pagina} totalPages={paginacion.paginas} total={paginacion.total}
        onPageChange={cambiarPagina} pageSize={paginacion.limite} mostrarTamanoPagina />}
      {paginacion?.total === 0 && <p className="propiedades__nota" role="status">Total: 0 propiedades</p>}

      <ConfirmarEliminacionModal isOpen={Boolean(pendienteEliminar)} onClose={() => { if (!eliminando) setPendienteEliminar(null); }}
        onConfirm={eliminarPropiedad} title="¿Seguro que desea eliminar esta propiedad?" />
      {modal && <PropiedadModal isOpen mode={modal.mode} propiedad={modal.propiedad} catalogos={catalogos}
        onClose={() => setModal(null)} onSubmit={guardarPropiedad} />}
    </main>
  );
}
