import { useState } from "react";
import { buildingColumnsIcon, clockIcon, fileLinesIcon, houseIcon, locationDotIcon, peopleIcon, tagIcon, toolboxIcon, userIcon, xIcon } from "../../assets/icons";
import SummaryPill from "../../components/summaryPill/SummaryPill";
import referenceDocument from "../../assets/reports-reference.png";
import "./MyProperties.css";

const properties = [
  { name: "Casa de fabricio", address: "Bielke 747", rent: "604.1034,19", tenant: "Matias Masiel", status: "alquilada" },
  { name: "Depa fabricio B2", address: "Bielke 454", rent: "550.000,10", tenant: "Sofia Ramirez", status: "alquilada" },
];

const reports = [
  { title: "Fuga de gas", person: "Sofia Ramirez", property: "Casa de san isidro", detail: "La pérdida se encuentra en la cocina.", tone: "danger", photo: "/images (1).jpg" },
  { title: "Humedad", person: "Matias Masiel", property: "Casa de fabricio", detail: "Humedad en la pared del dormitorio.", tone: "warning", photo: "/images.jpg" },
];

function Icon({ src }) { return <img className="owner-properties__icon" src={src} alt="" aria-hidden="true" />; }

export default function MyProperties() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openReport, setOpenReport] = useState(null);
  const property = properties[selectedIndex];

  return (
    <main id="owner-properties">
      <header className="owner-properties__hero"><div><h1>Tus propiedades</h1><p>toda la información de tus propiedades</p></div></header>
      <section className="owner-properties__summary" aria-label="Resumen de propiedades">
        <SummaryPill icon={peopleIcon} label="Propiedades" value={properties.length} tone="success" />
        <SummaryPill icon={xIcon} label="Reportes pendientes" value="2" tone="danger" />
        <SummaryPill icon={fileLinesIcon} label="Contratos vigentes" value="1" tone="info" />
        <SummaryPill icon={clockIcon} label="Propiedades en venta" value="0" tone="warning" />
      </section>

      <div className="owner-properties__layout">
        <aside className="owner-properties__list">
          <h2>Propiedades</h2>
          <label className="owner-properties__property-select">
            <span className="sr-only">Seleccionar propiedad</span>
            <select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>
              {properties.map((item, index) => <option value={index} key={item.name}>{item.name}</option>)}
            </select>
          </label>
          {properties.map((item, index) => <button className={`owner-properties__property${selectedIndex === index ? " is-selected" : ""}`} type="button" key={item.name} onClick={() => setSelectedIndex(index)}><Icon src={index === 0 ? houseIcon : buildingColumnsIcon} /><span>{item.name}</span></button>)}
        </aside>
        <section className="owner-properties__detail"><header><div><h2>{property.name}</h2><div className="owner-properties__facts"><span><Icon src={locationDotIcon} />Ubicación: {property.address}</span><span><Icon src={tagIcon} />Estado: {property.status}</span></div></div><div className="owner-properties__facts owner-properties__facts--right"><span><Icon src={fileLinesIcon} />Alquiler: {property.rent}</span><span><Icon src={userIcon} />Locatario: {property.tenant}</span></div></header><div className="owner-properties__document"><img src={referenceDocument} alt="Contrato de alquiler" /><div><Icon src={fileLinesIcon} /><strong>Contrato vigente</strong><small>06/10/2024 - 06/11/2027</small></div></div></section>
        <aside className="owner-properties__reports"><header><Icon src={toolboxIcon} /><h2>Reportes de inquilinos</h2></header>{reports.map((report, index) => <article className={`owner-properties__report${openReport === index ? " is-open" : ""}`} key={report.title} onClick={() => setOpenReport(openReport === index ? null : index)}><div className="owner-properties__report-summary"><Icon src={report.tone === "danger" ? xIcon : clockIcon} /><img className="owner-properties__report-image" src={report.photo} alt="" /><strong>{report.title}</strong><small>Hace 1 día</small><b>{openReport === index ? "⌃" : "›"}</b></div><p>{report.person}<br />{report.property}</p>{openReport === index && <div className="owner-properties__report-detail">{report.detail}</div>}</article>)}</aside>
      </div>
    </main>
  );
}
