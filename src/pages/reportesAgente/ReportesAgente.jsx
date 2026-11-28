import useListadoPaginado from "../../hooks/useListadoPaginado.js";
import PaginacionServidor from "../../components/paginacion/PaginacionServidor.jsx";
import { useEffect, useRef, useState } from "react";
import { Skeleton, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import { assetUrl } from "../../utils/assetUrl.js";
import { ROLES, rolActual } from "../../utils/roles.js";
import { estadoReporte } from "../../utils/estadoReporte.js";
import { angleDownIcon, calendarIcon, checkIcon, clockIcon, commentsIcon, houseIcon, locationDotIcon, magnifyingGlassIcon, plusIconWhite } from "../../assets/icons";
import ReporteModal from "./ReporteModal";
import "./ReportesAgente.css";

const ICONOS_ESTADO = { Abierto: clockIcon, "En proceso": clockIcon, Resuelto: checkIcon };
const FOTO_REPORTE_POR_DEFECTO = "/uploads/reportes/8414853068_a71ec481ef_b.jpg";
const fecha = (valor) => valor ? new Date(`${String(valor).slice(0, 10)}T12:00:00`).toLocaleDateString("es-AR") : "—";

export default function ReportesAgente() {
  const rol = rolActual();
  const puedeCambiarEstado = rol === ROLES.ADMIN || rol === ROLES.AGENTE;
  const puedeCrearReporte = rol === ROLES.INQUILINO;
  const [catalogos, setCatalogos] = useState({ categorias: [], estados: [], propiedades: [] });
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [revisionCatalogos, setRevisionCatalogos] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalCreacionAbierto, setModalCreacionAbierto] = useState(false);
  const [idReporteActivo, setIdReporteActivo] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const listado = useListadoPaginado(api.reportes, { busqueda: textoBusqueda, limite: 5 });
  const reportes = listado.datos;
  const cargando = listado.cargando;
  const errorVisible = listado.error || error;
  const [fotosSeleccionadas, setSelectedPhotos] = useState({});
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    let active = true;
    api.catalogosReportes()
      .then((catalogos) => {
        if (!active) return;
        setCatalogos(catalogos);
        setError("");
      })
      .catch((error) => {
        if (!active) return;
        setError(error.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los reportes", mensaje: error.message });
      })
      .finally(() => { if (active) setCargandoCatalogos(false); });
    return () => { active = false; };
  }, [revisionCatalogos]);


  const reporteActivo = reportes.find(({ id }) => id === idReporteActivo) ?? reportes[0] ?? null;
  const fotos = reporteActivo?.imagenes ?? [];
  const fotoSeleccionada = Math.min(fotosSeleccionadas[reporteActivo?.id] ?? 0, Math.max(fotos.length - 1, 0));

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[fotoSeleccionada];
    if (thumbnail) track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [reporteActivo?.id, fotoSeleccionada]);

  async function crearReporte(formulario) {
    setBusy(true);
    let created;
    try {
      created = await api.crearReporte({
        idPropiedad: Number(formulario.idPropiedad), idCategoria: Number(formulario.idCategoria),
        titulo: formulario.nombre, descripcion: formulario.descripcion,
        fecha: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      });
      if (formulario.fotos.length) await api.subirImagenesReporte(created.id, formulario.fotos);
      listado.recargar();
      listado.cambiarPagina(1);
      setIdReporteActivo(created.id);
      setTextoBusqueda("");
      setModalCreacionAbierto(false);
      mostrarAviso({ tipo: "exito", titulo: "Reporte creado", mensaje: "El reporte se guardó correctamente." });
    } catch (error) {
      if (created) {
        listado.recargar();
        listado.cambiarPagina(1);
        setModalCreacionAbierto(false);
        mostrarAviso({ tipo: "error", titulo: "Reporte creado sin todas las fotos", mensaje: error.message });
      } else {
        mostrarAviso({ tipo: "error", titulo: "No se pudo crear el reporte", mensaje: error.message });
      }
    } finally { setBusy(false); }
  }

  async function cambiarEstado(event) {
    const idEstado = Number(event.target.value);
    if (!reporteActivo || idEstado === reporteActivo.idEstado) return;
    setBusy(true);
    try {
      const updated = await api.actualizarReporte(reporteActivo.id, { idEstado });
      listado.recargar();
      mostrarAviso({ tipo: "exito", titulo: "Estado actualizado", mensaje: `El reporte está ${estadoReporte(updated.estado).toLowerCase()}.` });
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo cambiar el estado", mensaje: error.message });
    } finally { setBusy(false); }
  }

  return (
    <Skeleton as="main" id="reportes-agent" cargando={cargando}>
      <section className="reportes__hero" aria-labelledby="reportes-title">
        <div><h1 id="reportes-title">Reportes</h1><p>Gestioná los reportes de tus propiedades</p></div>
        {puedeCrearReporte && <button className="reportes__create-button" type="button"
          disabled={cargandoCatalogos || Boolean(error) || !catalogos.propiedades.length || !catalogos.categorias.length}
          onClick={() => setModalCreacionAbierto(true)}>
          <img src={plusIconWhite} alt="" aria-hidden="true" /> Nuevo reporte
        </button>}
      </section>
      <div className="reportes__workspace">
        <aside className="reportes__list-panel" aria-label="Listado de reportes">
          <label className="reportes__search">
            <img src={magnifyingGlassIcon} alt="" aria-hidden="true" />
            <input type="search" value={textoBusqueda}
              maxLength={255} onChange={(event) => setTextoBusqueda(event.target.value)}
              placeholder="Buscar reportes..." aria-label="Buscar reportes" />
          </label>
          <label className="reportes__propiedad-filter">
            <span className="reportes__propiedad-icon"><img src={houseIcon} alt="" aria-hidden="true" /></span>
            <select disabled aria-label="Filtrar reportes por propiedad"><option>Propiedad · Próximamente</option></select>
          </label>
          <div className="reportes__list">
            {reportes.map((report) => (
              <button key={report.id} className={`reportes__list-item ${reporteActivo?.id === report.id ? "is-active" : ""}`}
                type="button" onClick={() => setIdReporteActivo(report.id)}
                aria-pressed={reporteActivo?.id === report.id}>
                <img
                  className="reportes__photo reportes__photo--uploaded reportes__list-photo"
                  src={assetUrl(report.imagenes?.[0]?.url || FOTO_REPORTE_POR_DEFECTO)}
                  alt={report.titulo === undefined ? "Foto del reporte" : report.titulo}
                />
                <span className="reportes__list-copy">
                  <strong>{report.titulo}</strong>
                  <span><img src={locationDotIcon} alt="" aria-hidden="true" />{report.propiedad}</span>
                  <span><img src={calendarIcon} alt="" aria-hidden="true" />{fecha(report.fecha)}</span>
                  <span className="reportes__list-state">{estadoReporte(report.estado)}</span>
                </span>
                <img src={angleDownIcon} className="reportes__chevron" alt="" aria-hidden="true" />
              </button>
            ))}
            {!cargando && !errorVisible && !reportes.length &&
              <p className="reportes__empty">{reportes.length ? "No se encontraron reportes." : catalogos.propiedades.length ? "Todavía no hay reportes para tus propiedades." : "No tenés propiedades habilitadas para reportar."}</p>}
            {cargando && <p className="reportes__empty">Cargando reportes...</p>}
            {errorVisible && <p className="reportes__empty" role="alert">{errorVisible} <button type="button" onClick={() => {
              listado.recargar();
              if (error) { setCargandoCatalogos(true); setRevisionCatalogos((actual) => actual + 1); }
            }}>Reintentar</button></p>}
          </div>
          <PaginacionServidor paginacion={listado.paginacion} alCambiar={listado.cambiarPagina} />
        </aside>
        <section className="reportes__detail-panel" aria-labelledby="report-detail-title">
          {reporteActivo ? <>
            <header className="reportes__detail-header">
              <h2 id="report-detail-title">{reporteActivo.titulo}</h2>
              <p><img src={locationDotIcon} alt="" aria-hidden="true" />{reporteActivo.propiedad}</p>
            </header>
            <div className="reportes__detail-content">
              <div className="reportes__gallery">
                <div className="reportes__main-photo-frame">
                  <img
                    className="reportes__photo reportes__photo--uploaded reportes__main-photo"
                    src={assetUrl(fotos[fotoSeleccionada]?.url || FOTO_REPORTE_POR_DEFECTO)}
                    alt={reporteActivo.titulo === undefined ? "Foto del reporte" : reporteActivo.titulo}
                  />
                  {fotos.length > 1 && <>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--previous" type="button"
                      aria-label="Foto anterior" onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: (fotoSeleccionada - 1 + fotos.length) % fotos.length }))}><img src={angleDownIcon} alt="" aria-hidden="true" /></button>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--next" type="button"
                      aria-label="Foto siguiente" onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: (fotoSeleccionada + 1) % fotos.length }))}><img src={angleDownIcon} alt="" aria-hidden="true" /></button>
                  </>}
                  {!!fotos.length && <span className="reportes__photo-count">{fotoSeleccionada + 1}/{fotos.length}</span>}
                </div>
                {!!fotos.length && <div ref={thumbnailsRef} className="reportes__thumbnails" aria-label="Fotos del reporte">
                  {fotos.map((foto, index) => <button key={foto.id} className={`reportes__thumbnail-button${fotoSeleccionada === index ? " is-selected" : ""}`}
                    type="button" aria-label={`Ver foto ${index + 1}`} aria-pressed={fotoSeleccionada === index}
                    onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: index }))}>
                    <img
                      className="reportes__photo reportes__photo--uploaded reportes__thumbnail"
                      src={assetUrl(foto.url || FOTO_REPORTE_POR_DEFECTO)}
                      alt={`Foto ${index + 1}`}
                    />
                  </button>)}
                </div>}
              </div>
              <div className="reportes__details">
                <article className="reportes__description-card"><h3>Descripción del problema</h3><p>{reporteActivo.descripcion || "Sin descripción."}</p></article>
                <div className="reportes__facts">
                  <article><h3>Propiedad</h3><p><img src={houseIcon} alt="" aria-hidden="true" />{reporteActivo.propiedad}</p></article>
                  <article><h3>Tipo de problema</h3><p>{reporteActivo.categoria}</p></article>
                  <article><h3>Reportado por</h3><p>{reporteActivo.personaReporta}</p></article>
                  <article><h3>Fecha</h3><p>{fecha(reporteActivo.fecha)}</p></article>
                </div>
                {rol !== ROLES.AGENTE && <aside className="reportes__info-card">
                  <span className="reportes__info-icon"><img src={commentsIcon} alt="" aria-hidden="true" /></span>
                  <div><h3>Información</h3><p>Te notificaremos cuando se asigne un profesional o haya novedades sobre tu reporte.</p></div>
                </aside>}
              </div>
            </div>
            <div className="reportes__status-row">
              <div className={`reportes__status reportes__status--${reporteActivo.estado === "Resuelto" ? "solucionado" : reporteActivo.estado === "En proceso" ? "proceso" : "pendiente"}`} aria-label="Estado del reporte">
                <img src={ICONOS_ESTADO[reporteActivo.estado] || clockIcon} className="reportes__status-icon" alt="" aria-hidden="true" />
                {estadoReporte(reporteActivo.estado)}
              </div>
              {puedeCambiarEstado && <label className="reportes__status-control">
                Cambiar estado
                <select value={reporteActivo.idEstado} onChange={cambiarEstado} disabled={busy} aria-label="Cambiar estado del reporte">
                  {catalogos.estados.map((estado) => <option key={estado.id} value={estado.id}>{estadoReporte(estado.nombre)}</option>)}
                </select>
              </label>}
            </div>
          </> : <p className="reportes__empty" id="report-detail-title">Seleccioná un reporte para ver el detalle.</p>}
        </section>
      </div>
      {puedeCrearReporte && modalCreacionAbierto && <ReporteModal isOpen onClose={() => setModalCreacionAbierto(false)} onSubmit={crearReporte}
        propiedades={catalogos.propiedades} categorias={catalogos.categorias} busy={busy} />}
    </Skeleton>
  );
}
