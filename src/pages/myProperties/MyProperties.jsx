import { useState } from "react";
import { buildingColumnsIcon, clockIcon, fileLinesIcon, houseIcon, locationDotIcon, peopleIcon, tagIcon, toolboxIcon, userIcon, walletIcon, xIcon } from "../../assets/icons";
import SummaryPill from "../../components/summaryPill/SummaryPill";
import reportReference from "../../assets/reports-reference.png";
import "./MyProperties.css";

const properties = [
  { name: "Casa de fabricio", address: "Bielke 747", rent: "604.1034,19", tenant: "Matias Masiel", status: "alquilada" },
  { name: "Depa fabricio B2", address: "Bielke 454", rent: "550.000,10", tenant: "Sofia Ramirez", status: "alquilada" },
];

const reports = [
  { title: "Fuga de gas", person: "Sofia Ramirez", property: "Casa de san isidro", detail: "La pérdida se encuentra en la cocina.", tone: "danger" },
  { title: "Humedad", person: "Matias Masiel", property: "Casa de fabricio", detail: "Humedad en la pared del dormitorio.", tone: "warning" },
];

function Icon({ src }) { return <img className="owner-properties__icon" src={src} alt="" aria-hidden="true" />; }

function ReportPhoto({ title, className = "" }) {
  return <span className={`owner-properties__report-photo ${className}`} style={{ backgroundImage: `url(${reportReference})` }} role="img" aria-label={`Foto del reporte: ${title}`} />;
}

function ContractPreview({ property }) {
  return (
    <article className="owner-properties__contract-preview" aria-label={`Resumen del contrato de ${property.name}`}>
      <h3>Contrato de alquiler</h3>
      <p>Resumen del contrato vigente</p>
      <dl>
        <div><dt>Inmueble</dt><dd>{property.name}</dd></div>
        <div><dt>Ubicación</dt><dd>{property.address}</dd></div>
        <div><dt>Locatario</dt><dd>{property.tenant}</dd></div>
        <div><dt>Alquiler mensual</dt><dd>${property.rent}</dd></div>
        <div><dt>Vigencia</dt><dd>06/10/2024 - 06/11/2027</dd></div>
        <div><dt>Estado de la propiedad</dt><dd>{property.status}</dd></div>
      </dl>
    </article>
  );
}

export default function MyProperties() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openReport, setOpenReport] = useState(null);
  const property = properties[selectedIndex];

  return (
    <main id="owner-properties">
      <header className="owner-properties__hero"><div><h1>Tus propiedades</h1><p>toda la información de tus propiedades</p></div></header>
      <label className="owner-properties__mobile-select">
        <Icon src={buildingColumnsIcon} />
        <span className="sr-only">Propiedad</span>
        <select aria-label="Propiedad" value={selectedIndex} onChange={(event) => { setSelectedIndex(Number(event.target.value)); setOpenReport(null); }}>
          {properties.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
        </select>
      </label>
      <section className="owner-properties__summary" aria-label="Resumen de propiedades">
        <SummaryPill icon={peopleIcon} label="Propiedades" value={properties.length} tone="success" />
        <SummaryPill icon={xIcon} label="Reportes pendientes" value="2" tone="danger" />
        <SummaryPill icon={fileLinesIcon} label="Contratos vigentes" value="1" tone="info" />
        <SummaryPill icon={clockIcon} label="Propiedades en venta" value="0" tone="warning" />
      </section>

      <div className="owner-properties__layout">
        <aside className="owner-properties__list"><h2>Propiedades</h2>{properties.map((item, index) => <button className={`owner-properties__property${selectedIndex === index ? " is-selected" : ""}`} type="button" key={item.name} onClick={() => setSelectedIndex(index)}><Icon src={index === 0 ? houseIcon : buildingColumnsIcon} /><span>{item.name}</span></button>)}</aside>
        <section className="owner-properties__detail">
          <header>
            <div><h2>{property.name}</h2><div className="owner-properties__facts"><span><Icon src={locationDotIcon} />Ubicación: {property.address}</span><span><Icon src={tagIcon} />Estado: {property.status}</span></div></div>
            <div className="owner-properties__facts owner-properties__facts--right"><span><Icon src={walletIcon} />Alquiler: {property.rent}</span><span><Icon src={userIcon} />Locatario: {property.tenant}</span></div>
          </header>
          <div className="owner-properties__document"><ContractPreview property={property} /><div><Icon src={fileLinesIcon} /><strong>Contrato vigente</strong><small>06/10/2024 - 06/11/2027</small></div></div>
        </section>
        <aside className="owner-properties__reports">
          <header><Icon src={toolboxIcon} /><h2>Reportes de inquilinos</h2><span>2 pendientes</span></header>
          {reports.map((report, index) => (
            <article className={`owner-properties__report${openReport === index ? " is-open" : ""}`} key={report.title}>
              <button className="owner-properties__report-toggle" type="button" aria-expanded={openReport === index} aria-controls={`owner-report-${index}`} onClick={() => setOpenReport(openReport === index ? null : index)}>
                <ReportPhoto title={report.title} />
                <span className="owner-properties__report-copy">
                  <span className="owner-properties__report-summary"><span className={`owner-properties__report-dot is-${report.tone}`} /><strong>{report.title}</strong><small>Hace 1 día</small><b aria-hidden="true">{openReport === index ? "⌃" : "›"}</b></span>
                  <span className="owner-properties__report-person">{report.person}<br />{report.property}</span>
                </span>
              </button>
              <div className="owner-properties__report-detail" id={`owner-report-${index}`} hidden={openReport !== index}>
                <div className="owner-properties__report-photos">{[0, 1, 2].map((photo) => <ReportPhoto key={photo} title={`${report.title}, imagen ${photo + 1}`} />)}</div>
                <strong>{report.property}</strong>
                <p>Inquilino: {report.person}</p>
                <p>Descripción: {report.detail}</p>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}
