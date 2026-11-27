import { useEffect, useMemo, useRef, useState } from "react";
import { Paginacion, usePaginacion, Skeleton, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import { assetUrl } from "../../utils/assetUrl.js";
import { ROLES, rolActual } from "../../utils/roles.js";
import { estadoReporte } from "../../utils/estadoReporte.js";
import { angleDownIcon, calendarIcon, checkIcon, clockIcon, commentsIcon, houseIcon, locationDotIcon, magnifyingGlassIcon, plusIconWhite } from "../../assets/icons";
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
  const [reportes, setReportes] = useState([]);
  const [catalogos, setCatalogos] = useState({ categorias: [], estados: [], propiedades: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalCreacionAbierto, setModalCreacionAbierto] = useState(false);
  const [idReporteActivo, setIdReporteActivo] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState("");
  const [fotosSeleccionadas, setSelectedPhotos] = useState({});
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.reportes(), api.catalogosReportes()])
      .then(([reportesActualizados, catalogos]) => {
        if (!active) return;
        setReportes(reportesActualizados);
        setCatalogos(catalogos);
        setIdReporteActivo(reportesActualizados[0]?.id ?? null);
        setError("");
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los reportes", mensaje: cause.message });
      })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, []);

  const visibleReports = useMemo(() => {
    const busqueda = textoBusqueda.trim().toLocaleLowerCase("es-AR");
    return reportes.filter((report) =>
      (!propiedadSeleccionada || String(report.idPropiedad) === propiedadSeleccionada) &&
      (!busqueda || `${report.titulo} ${report.propiedad} ${report.categoria} ${report.descripcion || ""}`
        .toLocaleLowerCase("es-AR").includes(busqueda)));
  }, [textoBusqueda, reportes, propiedadSeleccionada]);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleReports, 5);
  const reporteActivo = pageItems.find(({ id }) => id === idReporteActivo) ?? pageItems[0] ?? null;
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
      const reportesActualizados = await api.reportes();
      setReportes(reportesActualizados);
      setIdReporteActivo(created.id);
      setTextoBusqueda("");
      setPropiedadSeleccionada("");
      resetPage();
      setModalCreacionAbierto(false);
      mostrarAviso({ tipo: "exito", titulo: "Reporte creado", mensaje: "El reporte se guardó correctamente." });
    } catch (cause) {
      if (created) {
        const reportesActualizados = await api.reportes().catch(() => null);
        if (reportesActualizados) setReportes(reportesActualizados);
        setModalCreacionAbierto(false);
        mostrarAviso({ tipo: "error", titulo: "Reporte creado sin todas las fotos", mensaje: cause.message });
      } else {
        mostrarAviso({ tipo: "error", titulo: "No se pudo crear el reporte", mensaje: cause.message });
      }
    } finally { setBusy(false); }
  }

  async function cambiarEstado(event) {
    const idEstado = Number(event.target.value);
    if (!reporteActivo || idEstado === reporteActivo.idEstado) return;
    setBusy(true);
    try {
      const updated = await api.actualizarReporte(reporteActivo.id, { idEstado });
      setReportes((items) => items.map((item) => item.id === updated.id ? updated : item));
      mostrarAviso({ tipo: "exito", titulo: "Estado actualizado", mensaje: `El reporte está ${estadoReporte(updated.estado).toLowerCase()}.` });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo cambiar el estado", mensaje: cause.message });
    } finally { setBusy(false); }
  }

  return (
    <Skeleton as="main" id="reportes-agent" cargando={cargando}>
      <section className="reportes__hero" aria-labelledby="reportes-title">
        <div><h1 id="reportes-title">Reportes</h1><p>Gestioná los reportes de tus propiedades</p></div>
        {puedeCrearReporte && <button className="reportes__create-button" type="button"
          disabled={cargando || !catalogos.propiedades.length || !catalogos.categorias.length}
          onClick={() => setModalCreacionAbierto(true)}>
          <Icono src={plusIconWhite} /> Nuevo reporte
        </button>}
      </section>
      <div className="reportes__workspace">
        <aside className="reportes__list-panel" aria-label="Listado de reportes">
          <label className="reportes__search">
            <Icono src={magnifyingGlassIcon} />
            <input type="search" value={textoBusqueda}
              onChange={(event) => { setTextoBusqueda(event.target.value); resetPage(); }}
              placeholder="Buscar reportes..." aria-label="Buscar reportes" />
          </label>
          <label className="reportes__propiedad-filter">
            <span className="reportes__propiedad-icon"><Icono src={houseIcon} /></span>
            <select value={propiedadSeleccionada}
              onChange={(event) => { setPropiedadSeleccionada(event.target.value); resetPage(); }}
              aria-label="Filtrar reportes por propiedad">
              <option value="">Todas las propiedades</option>
              {catalogos.propiedades.map((propiedad) => <option key={propiedad.id} value={propiedad.id}>{propiedad.nombre}</option>)}
            </select>
          </label>
          <div className="reportes__list">
            {pageItems.map((report) => (
              <button key={report.id} className={`reportes__list-item ${reporteActivo?.id === report.id ? "is-active" : ""}`}
                type="button" onClick={() => setIdReporteActivo(report.id)}
                aria-pressed={reporteActivo?.id === report.id}>
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
            {!cargando && !error && !visibleReports.length &&
              <p className="reportes__empty">{reportes.length ? "No se encontraron reportes." : catalogos.propiedades.length ? "Todavía no hay reportes para tus propiedades." : "No tenés propiedades habilitadas para reportar."}</p>}
            {cargando && <p className="reportes__empty">Cargando reportes...</p>}
            {error && <p className="reportes__empty" role="alert">{error}</p>}
          </div>
          <Paginacion page={page} totalPages={totalPages} total={visibleReports.length} pageSize={5} onPageChange={setPage} />
        </aside>
        <section className="reportes__detail-panel" aria-labelledby="report-detail-title">
          {reporteActivo ? <>
            <header className="reportes__detail-header">
              <h2 id="report-detail-title">{reporteActivo.titulo}</h2>
              <p><Icono src={locationDotIcon} />{reporteActivo.propiedad}</p>
            </header>
            <div className="reportes__detail-content">
              <div className="reportes__gallery">
                <div className="reportes__main-photo-frame">
                  <FotoReporte className="reportes__main-photo" label={reporteActivo.titulo} src={fotos[fotoSeleccionada]?.url} />
                  {fotos.length > 1 && <>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--previous" type="button"
                      aria-label="Foto anterior" onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: (fotoSeleccionada - 1 + fotos.length) % fotos.length }))}><Icono src={angleDownIcon} /></button>
                    <button className="reportes__gallery-arrow reportes__gallery-arrow--next" type="button"
                      aria-label="Foto siguiente" onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: (fotoSeleccionada + 1) % fotos.length }))}><Icono src={angleDownIcon} /></button>
                  </>}
                  {!!fotos.length && <span className="reportes__photo-count">{fotoSeleccionada + 1}/{fotos.length}</span>}
                </div>
                {!!fotos.length && <div ref={thumbnailsRef} className="reportes__thumbnails" aria-label="Fotos del reporte">
                  {fotos.map((foto, index) => <button key={foto.id} className={`reportes__thumbnail-button${fotoSeleccionada === index ? " is-selected" : ""}`}
                    type="button" aria-label={`Ver foto ${index + 1}`} aria-pressed={fotoSeleccionada === index}
                    onClick={() => setSelectedPhotos((current) => ({ ...current, [reporteActivo.id]: index }))}>
                    <FotoReporte className="reportes__thumbnail" src={foto.url} label={`Foto ${index + 1}`} />
                  </button>)}
                </div>}
              </div>
              <div className="reportes__details">
                <article className="reportes__description-card"><h3>Descripción del problema</h3><p>{reporteActivo.descripcion || "Sin descripción."}</p></article>
                <div className="reportes__facts">
                  <article><h3>Propiedad</h3><p><Icono src={houseIcon} />{reporteActivo.propiedad}</p></article>
                  <article><h3>Tipo de problema</h3><p>{reporteActivo.categoria}</p></article>
                  <article><h3>Reportado por</h3><p>{reporteActivo.personaReporta}</p></article>
                  <article><h3>Fecha</h3><p>{fecha(reporteActivo.fecha)}</p></article>
                </div>
                {rol !== ROLES.AGENTE && <aside className="reportes__info-card">
                  <span className="reportes__info-icon"><Icono src={commentsIcon} /></span>
                  <div><h3>Información</h3><p>Te notificaremos cuando se asigne un profesional o haya novedades sobre tu reporte.</p></div>
                </aside>}
              </div>
            </div>
            <div className="reportes__status-row">
              <div className={`reportes__status reportes__status--${reporteActivo.estado === "Resuelto" ? "solucionado" : reporteActivo.estado === "En proceso" ? "proceso" : "pendiente"}`} aria-label="Estado del reporte">
                <Icono src={ICONOS_ESTADO[reporteActivo.estado] || clockIcon} className="reportes__status-icon" />
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
