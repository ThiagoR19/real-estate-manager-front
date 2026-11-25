import { useEffect, useMemo, useRef, useState } from "react";
import { Paginacion, usePaginacion, Skeleton, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import { assetUrl } from "../../utils/assetUrl.js";
import { ROLES, rolActual } from "../../utils/roles.js";
import { estadoReporte } from "../../utils/estadoReporte.js";
import {
  angleDownIcon, calendarIcon, checkIcon, clockIcon, commentsIcon, houseIcon,
  locationDotIcon, magnifyingGlassIcon, plusIconWhite,
} from "../../assets/icons";
import ReporteModal from "./ReporteModal";
import "./ReportesAgente.css";

const ICONOS_ESTADO = { Abierto: clockIcon, "En proceso": clockIcon, Resuelto: checkIcon };
const FOTO_REPORTE_POR_DEFECTO = "/uploads/reportes/8414853068_a71ec481ef_b.jpg";
const fecha = (valor) => valor
  ? new Date(`${String(valor).slice(0, 10)}T12:00:00`).toLocaleDateString("es-AR")
  : "—";

function Icono({ src, className = "" }) {
  return <img src={src} className={className} alt="" aria-hidden="true" />;
}

function FotoReporte({ src, className = "", label = "Foto del reporte" }) {
  return <img className={`reportes__photo reportes__photo--uploaded ${className}`}
    src={assetUrl(src || FOTO_REPORTE_POR_DEFECTO)} alt={label} />;
}

export default function ReportesAgente() {
  const rol = rolActual();
  const puedeCambiarEstado = rol === ROLES.ADMIN || rol === ROLES.AGENTE;
  const puedeCrearReporte = rol === ROLES.INQUILINO;
  const [reportItems, setReportItems] = useState([]);
  const [catalogos, setCatalogos] = useState({ categorias: [], estados: [], propiedades: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.reportes(), api.catalogosReportes()])
      .then(([reports, catalogs]) => {
        if (!active) return;
        setReportItems(reports);
        setCatalogos(catalogs);
        setActiveReportId(reports[0]?.id ?? null);
        setError("");
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los reportes", mensaje: cause.message });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleReports = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("es-AR");
    return reportItems.filter((report) =>
      (!selectedProperty || String(report.idPropiedad) === selectedProperty) &&
      (!search || `${report.titulo} ${report.propiedad} ${report.categoria} ${report.descripcion || ""}`
        .toLocaleLowerCase("es-AR").includes(search)));
  }, [query, reportItems, selectedProperty]);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleReports, 5);
  const activeReport = pageItems.find(({ id }) => id === activeReportId) ?? pageItems[0] ?? null;
  const photos = activeReport?.imagenes ?? [];
  const selectedPhoto = Math.min(selectedPhotos[activeReport?.id] ?? 0, Math.max(photos.length - 1, 0));

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[selectedPhoto];
    if (thumbnail) track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [activeReport?.id, selectedPhoto]);

  async function createReport(form) {
    setBusy(true);
    let created;
    try {
      created = await api.crearReporte({
        idPropiedad: Number(form.idPropiedad), idCategoria: Number(form.idCategoria),
        titulo: form.name, descripcion: form.description,
        fecha: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      });
      if (form.photos.length) await api.subirImagenesReporte(created.id, form.photos);
      const reports = await api.reportes();
      setReportItems(reports);
      setActiveReportId(created.id);
      setQuery("");
      setSelectedProperty("");
      resetPage();
      setCreateOpen(false);
      mostrarAviso({ tipo: "exito", titulo: "Reporte creado", mensaje: "El reporte se guardó correctamente." });
    } catch (cause) {
      if (created) {
        const reports = await api.reportes().catch(() => null);
        if (reports) setReportItems(reports);
        setCreateOpen(false);
        mostrarAviso({ tipo: "error", titulo: "Reporte creado sin todas las fotos", mensaje: cause.message });
      } else {
        mostrarAviso({ tipo: "error", titulo: "No se pudo crear el reporte", mensaje: cause.message });
      }
    } finally { setBusy(false); }
  }

  async function changeStatus(event) {
    const idEstado = Number(event.target.value);
    if (!activeReport || idEstado === activeReport.idEstado) return;
    setBusy(true);
    try {
      const updated = await api.actualizarReporte(activeReport.id, { idEstado });
      setReportItems((items) => items.map((item) => item.id === updated.id ? updated : item));
      mostrarAviso({ tipo: "exito", titulo: "Estado actualizado", mensaje: `El reporte está ${estadoReporte(updated.estado).toLowerCase()}.` });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo cambiar el estado", mensaje: cause.message });
    } finally { setBusy(false); }
  }

  return (
    <Skeleton as="main" id="reportes-agent" cargando={loading}>
      <section className="reportes__hero" aria-labelledby="reportes-title">
        <div><h1 id="reportes-title">Reportes</h1><p>Gestioná los reportes de tus propiedades</p></div>
        {puedeCrearReporte && <button className="reportes__create-button" type="button"
          disabled={loading || !catalogos.propiedades.length || !catalogos.categorias.length}
          onClick={() => setCreateOpen(true)}>
          <Icono src={plusIconWhite} /> Nuevo reporte
        </button>}
      </section>
      <div className="reportes__workspace">
        <aside className="reportes__list-panel" aria-label="Listado de reportes">
          <label className="reportes__search">
            <Icono src={magnifyingGlassIcon} />
            <input type="search" value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
              placeholder="Buscar reportes..." aria-label="Buscar reportes" />
          </label>
          <label className="reportes__propiedad-filter">
            <span className="reportes__propiedad-icon"><Icono src={houseIcon} /></span>
            <select value={selectedProperty}
              onChange={(event) => { setSelectedProperty(event.target.value); resetPage(); }}
              aria-label="Filtrar reportes por propiedad">
              <option value="">Todas las propiedades</option>
              {catalogos.propiedades.map((property) => <option key={property.id} value={property.id}>{property.nombre}</option>)}
            </select>
          </label>
          <div className="reportes__list">
            {pageItems.map((report) => (
              <button key={report.id} className={`reportes__list-item ${activeReport?.id === report.id ? "is-active" : ""}`}
                type="button" onClick={() => setActiveReportId(report.id)}
                aria-pressed={activeReport?.id === report.id}>
                <FotoReporte className="reportes__list-photo" label={report.titulo} src={report.imagenes?.[0]?.url} />
                <span className="reportes__list-copy">
                  <strong>{report.titulo}</strong>
                  <span><Icono src={locationDotIcon} />{report.propiedad}</span>
                  <span><Icono src={calendarIcon} />{fecha(report.fecha)}</span>
                  <span className="reportes__list-state">{estadoReporte(report.estado)}</span>
                </span>
                <Icono src={angleDownIcon} className="reportes__chevron" />
              </button>
            ))}
            {!loading && !error && !visibleReports.length &&
              <p className="reportes__empty">{reportItems.length ? "No se encontraron reportes." : catalogos.propiedades.length ? "Todavía no hay reportes para tus propiedades." : "No tenés propiedades habilitadas para reportar."}</p>}
            {loading && <p className="reportes__empty">Cargando reportes...</p>}
            {error && <p className="reportes__empty" role="alert">{error}</p>}
          </div>
          <Paginacion page={page} totalPages={totalPages} total={visibleReports.length} pageSize={5} onPageChange={setPage} />
        </aside>
        <section className="reportes__detail-panel" aria-labelledby="report-detail-title">
          {activeReport ? <>
            <header className="reportes__detail-header">
              <h2 id="report-detail-title">{activeReport.titulo}</h2>
              <p><Icono src={locationDotIcon} />{activeReport.propiedad}</p>
            </header>
            <div className="reportes__detail-content">
              <div className="reportes__gallery">
                <div className="reportes__main-photo-frame">
                  <FotoReporte className="reportes__main-photo" label={activeReport.titulo} src={photos[selectedPhoto]?.url} />
                  {photos.length > 1 && <>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--previous" type="button"
                      aria-label="Foto anterior" onClick={() => setSelectedPhotos((current) => ({ ...current, [activeReport.id]: (selectedPhoto - 1 + photos.length) % photos.length }))}><Icono src={angleDownIcon} /></button>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--next" type="button"
                      aria-label="Foto siguiente" onClick={() => setSelectedPhotos((current) => ({ ...current, [activeReport.id]: (selectedPhoto + 1) % photos.length }))}><Icono src={angleDownIcon} /></button>
                  </>}
                  {!!photos.length && <span className="reportes__photo-count">{selectedPhoto + 1}/{photos.length}</span>}
                </div>
                {!!photos.length && <div ref={thumbnailsRef} className="reportes__thumbnails" aria-label="Fotos del reporte">
                  {photos.map((photo, index) => <button key={photo.id} className={`reportes__thumbnail-button${selectedPhoto === index ? " is-selected" : ""}`}
                    type="button" aria-label={`Ver foto ${index + 1}`} aria-pressed={selectedPhoto === index}
                    onClick={() => setSelectedPhotos((current) => ({ ...current, [activeReport.id]: index }))}>
                    <FotoReporte className="reportes__thumbnail" src={photo.url} label={`Foto ${index + 1}`} />
                  </button>)}
                </div>}
              </div>
              <div className="reportes__details">
                <article className="reportes__description-card"><h3>Descripción del problema</h3><p>{activeReport.descripcion || "Sin descripción."}</p></article>
                <div className="reportes__facts">
                  <article><h3>Propiedad</h3><p><Icono src={houseIcon} />{activeReport.propiedad}</p></article>
                  <article><h3>Tipo de problema</h3><p>{activeReport.categoria}</p></article>
                  <article><h3>Reportado por</h3><p>{activeReport.personaReporta}</p></article>
                  <article><h3>Fecha</h3><p>{fecha(activeReport.fecha)}</p></article>
                </div>
                {rol !== ROLES.AGENTE && <aside className="reportes__info-card">
                  <span className="reportes__info-icon"><Icono src={commentsIcon} /></span>
                  <div><h3>Información</h3><p>Te notificaremos cuando se asigne un profesional o haya novedades sobre tu reporte.</p></div>
                </aside>}
              </div>
            </div>
            <div className="reportes__status-row">
              <div className={`reportes__status reportes__status--${activeReport.estado === "Resuelto" ? "solucionado" : activeReport.estado === "En proceso" ? "proceso" : "pendiente"}`} aria-label="Estado del reporte">
                <Icono src={ICONOS_ESTADO[activeReport.estado] || clockIcon} className="reportes__status-icon" />
                {estadoReporte(activeReport.estado)}
              </div>
              {puedeCambiarEstado && <label className="reportes__status-control">
                Cambiar estado
                <select value={activeReport.idEstado} onChange={changeStatus} disabled={busy} aria-label="Cambiar estado del reporte">
                  {catalogos.estados.map((estado) => <option key={estado.id} value={estado.id}>{estadoReporte(estado.nombre)}</option>)}
                </select>
              </label>}
            </div>
          </> : <p className="reportes__empty" id="report-detail-title">Seleccioná un reporte para ver el detalle.</p>}
        </section>
      </div>
      {puedeCrearReporte && createOpen && <ReporteModal isOpen onClose={() => setCreateOpen(false)} onSubmit={createReport}
        propiedades={catalogos.propiedades} categorias={catalogos.categorias} busy={busy} />}
    </Skeleton>
  );
}
