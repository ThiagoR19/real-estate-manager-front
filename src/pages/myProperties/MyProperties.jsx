import { useState } from "react";
import {
  angleDownIcon,
  buildingColumnsIcon,
  clockIcon,
  fileLinesIcon,
  houseIcon,
  locationDotIcon,
  peopleIcon,
  tagIcon,
  toolboxIcon,
  userIcon,
  walletIcon,
  xIcon,
} from "../../assets/icons";
import { DropdownSelect, SummaryPill } from "../../components";
import referenceDocument from "../../assets/reports-reference.png";
import "./MyProperties.css";

const properties = [
  {
    name: "Casa de fabricio",
    address: "Bielke 747",
    rent: "604.1034,19",
    tenant: "Matias Masiel",
    status: "alquilada",
  },
  {
    name: "Depa fabricio B2",
    address: "Bielke 454",
    rent: "550.000,10",
    tenant: "Sofia Ramirez",
    status: "alquilada",
  },
];

const reports = [
  {
    title: "Fuga de gas",
    person: "Sofia Ramirez",
    property: "Casa de san isidro",
    detail:
      "Se detectó una pérdida en una conexión de gas de la cocina. El inquilino adjuntó imágenes para facilitar la revisión.",
    tone: "danger",
    photos: ["/images (1).jpg", "/images (1).jpg", "/images (1).jpg"],
  },
  {
    title: "Humedad",
    person: "Matias Masiel",
    property: "Casa de fabricio",
    detail: "Humedad en la pared del dormitorio.",
    tone: "warning",
    photos: ["/images.jpg", "/images.jpg", "/images.jpg"],
  },
];

function Icon({ src }) {
  return <img className="owner-properties__icon" src={src} alt="" aria-hidden="true" />;
}

export default function MyProperties() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openReport, setOpenReport] = useState(0);
  const property = properties[selectedIndex];

  return (
    <main id="owner-properties">
      <section className="owner-properties__overview" aria-labelledby="owner-properties-title">
        <header className="owner-properties__hero">
          <div>
            <h1 id="owner-properties-title">Tus propiedades</h1>
            <p>toda la información de tus propiedades</p>
          </div>
        </header>
        <div className="owner-properties__summary" aria-label="Resumen de propiedades">
          <SummaryPill
            icon={peopleIcon}
            label="Propiedades"
            value={properties.length}
            tone="success"
          />
          <SummaryPill icon={xIcon} label="Reportes pendientes" value="2" tone="danger" />
          <SummaryPill icon={fileLinesIcon} label="Contratos vigentes" value="1" tone="info" />
          <SummaryPill icon={clockIcon} label="Propiedades en venta" value="0" tone="warning" />
        </div>
      </section>

      <div className="owner-properties__layout">
        <aside className="owner-properties__list">
          <h2>Propiedades</h2>
          <DropdownSelect
            label="Seleccionar propiedad"
            value={property.name}
            options={properties.map((item) => item.name)}
            onChange={(name) =>
              setSelectedIndex(properties.findIndex((item) => item.name === name))
            }
            className="owner-properties__property-select"
            triggerClassName="owner-properties__property-trigger"
            valueClassName="owner-properties__property-value"
          />
          {properties.map((item, index) => (
            <button
              className={`owner-properties__property${selectedIndex === index ? " is-selected" : ""}`}
              type="button"
              key={item.name}
              onClick={() => setSelectedIndex(index)}
            >
              <Icon src={index === 0 ? houseIcon : buildingColumnsIcon} />
              <span>{item.name}</span>
            </button>
          ))}
        </aside>
        <section className="owner-properties__detail">
          <header>
            <div>
              <h2>{property.name}</h2>
              <div className="owner-properties__facts">
                <span>
                  <span className="owner-properties__fact-icon">
                    <Icon src={locationDotIcon} />
                  </span>
                  Ubicación: {property.address}
                </span>
                <span>
                  <span className="owner-properties__fact-icon">
                    <Icon src={tagIcon} />
                  </span>
                  Estado: {property.status}
                </span>
              </div>
            </div>
            <div className="owner-properties__facts owner-properties__facts--right">
              <span>
                <span className="owner-properties__fact-icon">
                  <Icon src={walletIcon} />
                </span>
                Alquiler: {property.rent}
              </span>
              <span>
                <span className="owner-properties__fact-icon">
                  <Icon src={userIcon} />
                </span>
                Locatario: {property.tenant}
              </span>
            </div>
          </header>
          <div className="owner-properties__document">
            <img src={referenceDocument} alt="Contrato de alquiler" />
            <div>
              <Icon src={fileLinesIcon} />
              <strong>Contrato vigente</strong>
              <small>06/10/2024 - 06/11/2027</small>
            </div>
          </div>
        </section>
        <aside
          className="owner-properties__reports"
          aria-labelledby="owner-properties-reports-title"
        >
          <header>
            <Icon src={toolboxIcon} />
            <h2 id="owner-properties-reports-title">Reportes de inquilinos</h2>
            <span className="owner-properties__pending">2 pendientes</span>
          </header>
          <div className="owner-properties__report-list">
            {reports.map((report, index) => (
              <button
                className={`owner-properties__report${openReport === index ? " is-open" : ""}`}
                key={report.title}
                type="button"
                aria-expanded={openReport === index}
                onClick={() => setOpenReport(openReport === index ? null : index)}
              >
                <span className="owner-properties__report-summary">
                  <img className="owner-properties__report-image" src={report.photos[0]} alt="" />
                  <span
                    className={`owner-properties__report-dot${report.tone === "warning" ? " is-warning" : ""}`}
                  />
                  <strong>{report.title}</strong>
                  <small>Hace 1 día</small>
                  <img
                    className={`owner-properties__report-chevron${openReport === index ? " is-open" : ""}`}
                    src={angleDownIcon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="owner-properties__report-meta">
                    {report.person}
                    <br />
                    {report.property}
                  </span>
                </span>
                {openReport === index && (
                  <span className="owner-properties__report-detail">
                    <span className="owner-properties__report-gallery">
                      {report.photos.map((photo, photoIndex) => (
                        <img
                          src={photo}
                          alt={`Imagen ${photoIndex + 1} del reporte ${report.title}`}
                          key={`${photo}-${photoIndex}`}
                        />
                      ))}
                    </span>
                    <span className="owner-properties__report-property">{report.property}</span>
                    <span>Inquilino: {report.person}</span>
                    <span className="owner-properties__report-description">
                      <strong>Descripción:</strong> {report.detail}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
