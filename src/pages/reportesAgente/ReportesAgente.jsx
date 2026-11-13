import { useEffect, useMemo, useRef, useState } from "react";
import reportReference from "../../assets/reports-reference.png";
import { Paginacion, usePaginacion, PAGE_SIZE } from "../../components";
import ReporteModal from "./ReporteModal";
import { houseIcon, relojHomeIcon } from "../../assets/icons";
import "./ReportesAgente.css";

const initialReports = [
  {
    id: 1,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
    type: "Plomería",
    description:
      "Hay una pérdida de agua en la canilla de la cocina. Gotea constantemente, incluso cuando está cerrado. Adjunto fotos para que puedan ver el problema",
  },
  {
    id: 2,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
    type: "Plomería",
    description:
      "Hay una pérdida de agua en la canilla de la cocina. Gotea constantemente, incluso cuando está cerrado. Adjunto fotos para que puedan ver el problema",
  },
  {
    id: 3,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
    type: "Plomería",
    description:
      "Hay una pérdida de agua en la canilla de la cocina. Gotea constantemente, incluso cuando está cerrado. Adjunto fotos para que puedan ver el problema",
  },
];

function IconoDibujado({ name }) {
  return <span className={`reportes__drawn-icon reportes__drawn-icon--${name}`} aria-hidden="true" />;
}

function FotoReporte({ className = "", label = "Foto del reporte", src }) {
  if (src) {
    return (
      <img
        className={`reportes__photo reportes__photo--uploaded ${className}`}
        src={src}
        alt={label}
      />
    );
  }

  return (
    <svg
      className={`reportes__photo ${className}`}
      viewBox="547 301 317 247"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <image href={reportReference} width="1521" height="751" />
    </svg>
  );
}

export default function ReportesAgente({ allowCreate = false }) {
  const [reportItems, setReportItems] = useState(initialReports);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState(initialReports[0].id);
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("Todas las propiedades");
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const thumbnailsRef = useRef(null);
  const uploadedUrls = useRef([]);

  useEffect(() => () => uploadedUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const visibleReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reportItems.filter(({ title, location }) => {
      const matchesQuery =
        !normalizedQuery || `${title} ${location}`.toLowerCase().includes(normalizedQuery);
      const matchesProperty =
        selectedProperty === "Todas las propiedades" || location === selectedProperty;
      return matchesQuery && matchesProperty;
    });
  }, [query, reportItems, selectedProperty]);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleReports);

  const properties = [...new Set(reportItems.map(({ location }) => location))];

  const activeReport =
    pageItems.find(({ id }) => id === activeReportId) ?? pageItems[0] ?? reportItems[0];
  const photos = activeReport.photos?.length ? activeReport.photos : [{}, {}, {}];
  const selectedPhoto = Math.min(selectedPhotos[activeReport.id] ?? 0, photos.length - 1);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[selectedPhoto];
    if (thumbnail)
      track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [activeReport.id, selectedPhoto]);

  function selectPhoto(index) {
    setSelectedPhotos((current) => ({ ...current, [activeReport.id]: index }));
  }

  function createReport(form) {
    const id = Date.now();
    const photos = form.photos.map((file) => ({ url: URL.createObjectURL(file) }));
    uploadedUrls.current.push(...photos.map(({ url }) => url));
    setReportItems((current) => [
      ...current,
      {
        id,
        title: form.name || "Nuevo reporte",
        type: form.type,
        description: form.description,
        location: initialReports[0].location,
        date: new Date().toLocaleDateString("es-AR"),
        photos,
      },
    ]);
    setActiveReportId(id);
    setQuery("");
    setSelectedProperty("Todas las propiedades");
    setPage(Math.ceil((reportItems.length + 1) / PAGE_SIZE));
    setCreateOpen(false);
  }

  return (
    <main id="reportes-agent">
      <section className="reportes__hero" aria-labelledby="reportes-title">
        <div>
          <h1 id="reportes-title">Reportes</h1>
          <p>Gestiona los reportes de tus propiedades</p>
        </div>
        {allowCreate && (
          <button
            className="reportes__create-button"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            ＋ Nuevo reporte
          </button>
        )}
      </section>

      <div className="reportes__workspace">
        <aside className="reportes__list-panel" aria-label="Listado de reportes">
          <label className="reportes__search">
            <IconoDibujado name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
            />
          </label>

          {!allowCreate && (
            <label className="reportes__propiedad-filter">
              <span className="reportes__propiedad-icon">
                <img src={houseIcon} alt="" aria-hidden="true" />
              </span>
              <select
                value={selectedProperty}
                onChange={(event) => { setSelectedProperty(event.target.value); resetPage(); }}
                aria-label="Filtrar reportes por propiedad"
              >
                <option>Todas las propiedades</option>
                {properties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
              <span className="reportes__propiedad-chevron" aria-hidden="true" />
            </label>
          )}

          <div className="reportes__list">
            {pageItems.map((report, index) => (
              <button
                key={report.id}
                className={`reportes__list-item ${activeReport.id === report.id ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveReportId(report.id)}
                aria-pressed={activeReport.id === report.id}
              >
                <FotoReporte
                  className="reportes__list-photo"
                  label={report.title}
                  src={report.photos?.[0]?.url}
                />
                <span className="reportes__list-copy">
                  <strong>{report.title}</strong>
                  <span>
                    <IconoDibujado name="location" />
                    {report.location}
                  </span>
                  <span>
                    <IconoDibujado name="calendar" />
                    {report.date}
                  </span>
                </span>
                <span className="reportes__chevron" aria-hidden="true" />
                {index > 0 && (
                  <span className="reportes__pending-dot" aria-label="Reporte pendiente" />
                )}
              </button>
            ))}
            {!visibleReports.length && (
              <p className="reportes__empty">No se encontraron reportes.</p>
            )}
          </div>
          <Paginacion page={page} totalPages={totalPages} total={visibleReports.length} onPageChange={setPage} />
        </aside>

        <section className="reportes__detail-panel" aria-labelledby="report-detail-title">
          <header className="reportes__detail-header">
            <h2 id="report-detail-title">{activeReport.title}</h2>
            <p>
              <IconoDibujado name="location" />
              {activeReport.location}
            </p>
          </header>

          <div className="reportes__detail-content">
            <div className="reportes__gallery">
              <div className="reportes__main-photo-frame">
                <FotoReporte
                  className="reportes__main-photo"
                  label={activeReport.title}
                  src={photos[selectedPhoto].url}
                />
                <button
                  className="reportes__gallery-arrow reportes__gallery-arrow--previous"
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => selectPhoto((selectedPhoto - 1 + photos.length) % photos.length)}
                >
                  ‹
                </button>
                <button
                  className="reportes__gallery-arrow reportes__gallery-arrow--next"
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={() => selectPhoto((selectedPhoto + 1) % photos.length)}
                >
                  ›
                </button>
                <span className="reportes__photo-count">
                  {selectedPhoto + 1}/{photos.length}
                </span>
              </div>
              <div
                ref={thumbnailsRef}
                className="reportes__thumbnails"
                aria-label="Fotos del reporte"
              >
                {photos.map((photo, index) => (
                  <button
                    key={photo.url ?? `reference-${index}`}
                    className={`reportes__thumbnail-button${selectedPhoto === index ? " is-selected" : ""}`}
                    type="button"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={selectedPhoto === index}
                    onClick={() => selectPhoto(index)}
                  >
                    <FotoReporte
                      className="reportes__thumbnail"
                      label={`Foto ${index + 1}`}
                      src={photo.url}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="reportes__details">
              <article className="reportes__description-card">
                <h3>Descripción del problema</h3>
                <p>{activeReport.description || "Sin descripción."}</p>
              </article>

              <div className="reportes__facts">
                <article>
                  <h3>Ubicación</h3>
                  <p>
                    <span aria-hidden="true">•</span>
                    {activeReport.location}
                  </p>
                </article>
                <article>
                  <h3>Tipo de problema</h3>
                  <p>{activeReport.type || "Plomería"}</p>
                </article>
              </div>

              <aside className="reportes__info-card">
                <span className="reportes__info-icon">
                  <IconoDibujado name="message" />
                </span>
                <div>
                  <h3>Información</h3>
                  <p>
                    Te notificaremos cuando se asigne un profesional o haya novedades sobre tu
                    reporte
                  </p>
                </div>
              </aside>
            </div>
          </div>

          <div className="reportes__status" aria-label="Estado del reporte">
            <img className="reportes__status-icon" src={relojHomeIcon} alt="" aria-hidden="true" />
            En proceso
          </div>
        </section>
      </div>
      {createOpen && (
        <ReporteModal isOpen onClose={() => setCreateOpen(false)} onSubmit={createReport} />
      )}
    </main>
  );
}
