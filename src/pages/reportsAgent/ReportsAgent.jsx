import { useEffect, useMemo, useRef, useState } from "react";
import reportReference from "../../assets/reports-reference.png";
import { ReportModal } from "../../components";
import { houseIcon, relojHomeIcon } from "../../assets/icons";
import "./ReportsAgent.css";

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

function DrawnIcon({ name }) {
  return <span className={`reports__drawn-icon reports__drawn-icon--${name}`} aria-hidden="true" />;
}

function ReportPhoto({ className = "", label = "Foto del reporte", src }) {
  if (src) {
    return (
      <img
        className={`reports__photo reports__photo--uploaded ${className}`}
        src={src}
        alt={label}
      />
    );
  }

  return (
    <svg
      className={`reports__photo ${className}`}
      viewBox="547 301 317 247"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <image href={reportReference} width="1521" height="751" />
    </svg>
  );
}

export default function ReportsAgent({ allowCreate = false }) {
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

  const properties = [...new Set(reportItems.map(({ location }) => location))];

  const activeReport =
    visibleReports.find(({ id }) => id === activeReportId) ?? visibleReports[0] ?? reportItems[0];
  const photos = activeReport.photos?.length ? activeReport.photos : [{}, {}, {}];
  const selectedPhoto = Math.min(selectedPhotos[activeReport.id] ?? 0, photos.length - 1);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[selectedPhoto];
    if (thumbnail)
      track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [activeReportId, selectedPhoto]);

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
    setCreateOpen(false);
  }

  return (
    <main id="reports-agent">
      <section className="reports__hero" aria-labelledby="reports-title">
        <div>
          <h1 id="reports-title">Reportes</h1>
          <p>Gestiona los reportes de tus propiedades</p>
        </div>
        {allowCreate && (
          <button
            className="reports__create-button"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            ＋ Nuevo reporte
          </button>
        )}
      </section>

      <div className="reports__workspace">
        <aside className="reports__list-panel" aria-label="Listado de reportes">
          <label className="reports__search">
            <DrawnIcon name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
            />
          </label>

          {!allowCreate && (
            <label className="reports__property-filter">
              <span className="reports__property-icon">
                <img src={houseIcon} alt="" aria-hidden="true" />
              </span>
              <select
                value={selectedProperty}
                onChange={(event) => setSelectedProperty(event.target.value)}
                aria-label="Filtrar reportes por propiedad"
              >
                <option>Todas las propiedades</option>
                {properties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
              <span className="reports__property-chevron" aria-hidden="true" />
            </label>
          )}

          <div className="reports__list">
            {visibleReports.map((report, index) => (
              <button
                key={report.id}
                className={`reports__list-item ${activeReportId === report.id ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveReportId(report.id)}
                aria-pressed={activeReportId === report.id}
              >
                <ReportPhoto
                  className="reports__list-photo"
                  label={report.title}
                  src={report.photos?.[0]?.url}
                />
                <span className="reports__list-copy">
                  <strong>{report.title}</strong>
                  <span>
                    <DrawnIcon name="location" />
                    {report.location}
                  </span>
                  <span>
                    <DrawnIcon name="calendar" />
                    {report.date}
                  </span>
                </span>
                <span className="reports__chevron" aria-hidden="true" />
                {index > 0 && (
                  <span className="reports__pending-dot" aria-label="Reporte pendiente" />
                )}
              </button>
            ))}
            {!visibleReports.length && (
              <p className="reports__empty">No se encontraron reportes.</p>
            )}
          </div>
        </aside>

        <section className="reports__detail-panel" aria-labelledby="report-detail-title">
          <header className="reports__detail-header">
            <h2 id="report-detail-title">{activeReport.title}</h2>
            <p>
              <DrawnIcon name="location" />
              {activeReport.location}
            </p>
          </header>

          <div className="reports__detail-content">
            <div className="reports__gallery">
              <div className="reports__main-photo-frame">
                <ReportPhoto
                  className="reports__main-photo"
                  label={activeReport.title}
                  src={photos[selectedPhoto].url}
                />
                <button
                  className="reports__gallery-arrow reports__gallery-arrow--previous"
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => selectPhoto((selectedPhoto - 1 + photos.length) % photos.length)}
                >
                  ‹
                </button>
                <button
                  className="reports__gallery-arrow reports__gallery-arrow--next"
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={() => selectPhoto((selectedPhoto + 1) % photos.length)}
                >
                  ›
                </button>
                <span className="reports__photo-count">
                  {selectedPhoto + 1}/{photos.length}
                </span>
              </div>
              <div
                ref={thumbnailsRef}
                className="reports__thumbnails"
                aria-label="Fotos del reporte"
              >
                {photos.map((photo, index) => (
                  <button
                    key={photo.url ?? `reference-${index}`}
                    className={`reports__thumbnail-button${selectedPhoto === index ? " is-selected" : ""}`}
                    type="button"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={selectedPhoto === index}
                    onClick={() => selectPhoto(index)}
                  >
                    <ReportPhoto
                      className="reports__thumbnail"
                      label={`Foto ${index + 1}`}
                      src={photo.url}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="reports__details">
              <article className="reports__description-card">
                <h3>Descripción del problema</h3>
                <p>{activeReport.description || "Sin descripción."}</p>
              </article>

              <div className="reports__facts">
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

              <aside className="reports__info-card">
                <span className="reports__info-icon">
                  <DrawnIcon name="message" />
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

          <div className="reports__status" aria-label="Estado del reporte">
            <img className="reports__status-icon" src={relojHomeIcon} alt="" aria-hidden="true" />
            En proceso
          </div>
        </section>
      </div>
      {createOpen && (
        <ReportModal isOpen onClose={() => setCreateOpen(false)} onSubmit={createReport} />
      )}
    </main>
  );
}
