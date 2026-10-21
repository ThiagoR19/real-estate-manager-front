import { useEffect, useMemo, useRef, useState } from "react";
import reportReference from "../../assets/reports-reference.png";
import "./Reports.css";

const reports = [
  {
    id: 1,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
  },
  {
    id: 2,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
  },
  {
    id: 3,
    title: "Pérdida de agua en la cocina",
    location: "Bielke 454 - Depto. 3B",
    date: "12/09/2025",
  },
];

function DrawnIcon({ name }) {
  return <span className={`reports__drawn-icon reports__drawn-icon--${name}`} aria-hidden="true" />;
}

function ReportPhoto({ className = "", label = "Foto del reporte" }) {
  return (
    <div
      className={`reports__photo ${className}`}
      style={{ "--report-photo": `url(${reportReference})` }}
      role="img"
      aria-label={label}
    />
  );
}

export default function Reports() {
  const [activeReportId, setActiveReportId] = useState(reports[0].id);
  const [query, setQuery] = useState("");
  const [photoUrls, setPhotoUrls] = useState([]);
  const photoUrlsRef = useRef([]);

  const visibleReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return reports;

    return reports.filter(({ title, location }) =>
      `${title} ${location}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const activeReport = reports.find(({ id }) => id === activeReportId) ?? reports[0];

  useEffect(() => () => photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addPhotos(event) {
    const newUrls = Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file));
    setPhotoUrls((currentUrls) => {
      const nextUrls = [...currentUrls, ...newUrls];
      photoUrlsRef.current = nextUrls;
      return nextUrls;
    });
    event.target.value = "";
  }

  return (
    <main id="reports">
      <section className="reports__hero" aria-labelledby="reports-title">
        <div>
          <h1 id="reports-title">Inquilinos</h1>
          <p>Gestiona la información de todos lo inquilinos, sus contratos, pagos y estados.</p>
        </div>
        <button className="reports__new-button" type="button">
          <span aria-hidden="true">+</span>
          Nuevo reporte
        </button>
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

          <div className="reports__list">
            {visibleReports.map((report) => (
              <button
                key={report.id}
                className={`reports__list-item ${activeReportId === report.id ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveReportId(report.id)}
                aria-pressed={activeReportId === report.id}
              >
                <ReportPhoto className="reports__list-photo" label="Foto de pérdida de agua" />
                <span className="reports__list-copy">
                  <strong>{report.title}</strong>
                  <span><DrawnIcon name="location" />{report.location}</span>
                  <span><DrawnIcon name="calendar" />{report.date}</span>
                </span>
                <span className="reports__chevron" aria-hidden="true" />
              </button>
            ))}
            {!visibleReports.length && <p className="reports__empty">No se encontraron reportes.</p>}
          </div>
        </aside>

        <section className="reports__detail-panel" aria-labelledby="report-detail-title">
          <header className="reports__detail-header">
            <h2 id="report-detail-title">{activeReport.title}</h2>
            <p><DrawnIcon name="location" />{activeReport.location}</p>
          </header>

          <div className="reports__detail-content">
            <div className="reports__gallery">
              <ReportPhoto className="reports__main-photo" label="Pérdida de agua en la cocina" />
              <div className="reports__thumbnails" aria-label="Fotos del reporte">
                <ReportPhoto className="reports__thumbnail is-selected" label="Foto principal" />
                <ReportPhoto className="reports__thumbnail" label="Foto adicional" />
                <ReportPhoto className="reports__thumbnail" label="Foto adicional" />
              </div>
              {photoUrls.length > 0 && (
                <div className="reports__uploaded-thumbnails">
                  {photoUrls.map((url) => (
                    <img key={url} src={url} alt="Foto agregada al reporte" />
                  ))}
                </div>
              )}
              <label className="reports__add-photos">
                <span aria-hidden="true">+</span>
                Agregar fotos
                <input type="file" accept="image/*" multiple onChange={addPhotos} />
              </label>
            </div>

            <div className="reports__details">
              <article className="reports__description-card">
                <h3>Descripción del problema</h3>
                <p>Hay una pérdida de agua en la canilla de la cocina. Gotea constantemente, incluso cuando está cerrado. Adjunto fotos para que puedan ver el problema</p>
              </article>

              <div className="reports__facts">
                <article>
                  <h3>Ubicación</h3>
                  <p><span aria-hidden="true">•</span>{activeReport.location}</p>
                </article>
                <article>
                  <h3>Tipo de problema</h3>
                  <p>Plomería</p>
                </article>
              </div>

              <aside className="reports__info-card">
                <span className="reports__info-icon"><DrawnIcon name="message" /></span>
                <div>
                  <h3>Información</h3>
                  <p>Te notificaremos cuando se asigne un profesional o haya novedades sobre tu reporte</p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
