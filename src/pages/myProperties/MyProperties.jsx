import { useEffect, useMemo, useState } from "react";
import {
  angleDownIcon, buildingColumnsIcon, clockIcon, fileLinesIcon, houseIcon,
  locationDotIcon, peopleIcon, tagIcon, toolboxIcon, userIcon, walletIcon, xIcon,
} from "../../assets/icons";
import { DropdownSelect, SummaryPill, Pagination, usePagination, PROPERTY_PAGE_SIZE } from "../../components";
import { api } from "../../services/api.js";
import "./MyProperties.css";

const money = (amount, currency) => amount == null ? "—" : new Intl.NumberFormat("es-AR", { style: "currency", currency: currency || "ARS" }).format(Number(amount));
const date = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("es-AR") : "—";
const pending = (report) => !/resuelt|cerrad|finalizad/i.test(report.estado || "");

function Icon({ src }) {
  return <img className="owner-properties__icon" src={src} alt="" aria-hidden="true" />;
}

export default function MyProperties() {
  const [contracts, setContracts] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [openReport, setOpenReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState({ contractId: null, items: [] });

  useEffect(() => {
    let active = true;
    Promise.all([api.contracts(), api.reports()])
      .then(([contractRows, reportRows]) => {
        if (!active) return;
        setContracts(contractRows);
        setReports(reportRows);
        setSelectedId(contractRows[0]?.idPropiedad ?? null);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const properties = useMemo(() => {
    const unique = new Map();
    for (const contract of contracts) {
      if (!unique.has(contract.idPropiedad)) unique.set(contract.idPropiedad, {
        id: contract.idPropiedad, name: contract.propiedad, address: contract.propiedadUbicacion,
        contracts: [],
      });
      unique.get(contract.idPropiedad).contracts.push(contract);
    }
    return [...unique.values()];
  }, [contracts]);
  const propertyPages = usePagination(properties, PROPERTY_PAGE_SIZE);
  const property = properties.find((item) => item.id === selectedId);
  const propertyContracts = property?.contracts || [];
  const activeContract = propertyContracts.find((item) => item.estado === "Vigente") || propertyContracts[0];
  const activeContractId = activeContract?.id;
  const visibleDocuments = documents.contractId === activeContractId ? documents.items : [];
  const visibleReports = reports.filter((item) => item.idPropiedad === selectedId);
  const reportPages = usePagination(visibleReports);
  const pendingReports = reports.filter((item) => properties.some((propertyItem) => propertyItem.id === item.idPropiedad) && pending(item));
  const tenant = activeContract?.participantes?.filter((item) => item.rol === "Inquilino").map((item) => `${item.nombre} ${item.apellido}`).join(", ") || "—";

  useEffect(() => {
    if (!activeContractId) return undefined;
    let active = true;
    api.contractDocuments(activeContractId)
      .then((rows) => { if (active) setDocuments({ contractId: activeContractId, items: rows }); })
      .catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [activeContractId]);

  function changePropertyPage(nextPage) {
    propertyPages.setPage(nextPage);
    setSelectedId(properties[(nextPage - 1) * PROPERTY_PAGE_SIZE]?.id ?? null);
    reportPages.resetPage();
  }

  return (
    <main id="owner-properties">
      <section className="owner-properties__overview" aria-labelledby="owner-properties-title">
        <header className="owner-properties__hero"><div><h1 id="owner-properties-title">Tus propiedades</h1><p>Toda la información de tus propiedades</p></div></header>
        <div className="owner-properties__summary" aria-label="Resumen de propiedades">
          <SummaryPill icon={peopleIcon} label="Propiedades" value={properties.length} tone="success" />
          <SummaryPill icon={xIcon} label="Reportes pendientes" value={pendingReports.length} tone="danger" />
          <SummaryPill icon={fileLinesIcon} label="Contratos vigentes" value={contracts.filter((item) => item.estado === "Vigente").length} tone="info" />
          <SummaryPill icon={clockIcon} label="Propiedades en venta" value={properties.filter((item) => item.contracts.some((contract) => contract.tipo === "Venta" && contract.estado === "Vigente")).length} tone="warning" />
        </div>
      </section>
      {error && <p className="owner-properties__message" role="alert">{error}</p>}
      {loading && <p className="owner-properties__message" role="status">Cargando propiedades…</p>}
      {!loading && !error && !properties.length && <p className="owner-properties__message">No tenés propiedades asociadas a contratos todavía.</p>}
      {property && (
        <div className="owner-properties__layout">
          <aside className="owner-properties__list">
            <h2>Propiedades</h2>
            <DropdownSelect label="Seleccionar propiedad" value={property.name} options={properties.map((item) => item.name)} onChange={(name) => { const index = properties.findIndex((item) => item.name === name); if (index < 0) return; setSelectedId(properties[index].id); propertyPages.setPage(Math.floor(index / PROPERTY_PAGE_SIZE) + 1); reportPages.resetPage(); }} className="owner-properties__property-select" triggerClassName="owner-properties__property-trigger" valueClassName="owner-properties__property-value" />
            {propertyPages.pageItems.map((item, index) => <button className={`owner-properties__property${selectedId === item.id ? " is-selected" : ""}`} type="button" key={item.id} onClick={() => { setSelectedId(item.id); reportPages.resetPage(); }}><Icon src={index === 0 ? houseIcon : buildingColumnsIcon} /><span>{item.name}</span></button>)}
            <Pagination page={propertyPages.page} totalPages={propertyPages.totalPages} total={properties.length} onPageChange={changePropertyPage} pageSize={PROPERTY_PAGE_SIZE} />
          </aside>
          <section className="owner-properties__detail">
            <header><div><h2>{property.name}</h2><div className="owner-properties__facts"><span><span className="owner-properties__fact-icon"><Icon src={locationDotIcon} /></span>Ubicación: {property.address || "—"}</span><span><span className="owner-properties__fact-icon"><Icon src={tagIcon} /></span>Estado: {activeContract?.estado || "—"}</span></div></div><div className="owner-properties__facts owner-properties__facts--right"><span><span className="owner-properties__fact-icon"><Icon src={walletIcon} /></span>Alquiler: {activeContract?.tipo === "Alquiler" ? money(activeContract.montoAcordado, activeContract.moneda) : "—"}</span><span><span className="owner-properties__fact-icon"><Icon src={userIcon} /></span>Locatario: {tenant}</span></div></header>
            <div className="owner-properties__document"><div><Icon src={fileLinesIcon} /><strong>Contrato {activeContract?.estado?.toLowerCase() || "registrado"}</strong><small>{date(activeContract?.fechaInicio)} - {date(activeContract?.fechaFin)}</small></div>{visibleDocuments.length ? visibleDocuments.map((document) => <button className="owner-properties__download" type="button" key={document.id} onClick={() => api.downloadDocument(document).catch((cause) => setError(cause.message))}>Descargar {document.titulo}</button>) : <small>No hay un contrato disponible para descargar.</small>}</div>
            {propertyContracts.length > 1 && <p className="owner-properties__message">{propertyContracts.length} contratos asociados a esta propiedad</p>}
          </section>
          <aside className="owner-properties__reports" aria-labelledby="owner-properties-reports-title">
            <header><Icon src={toolboxIcon} /><h2 id="owner-properties-reports-title">Reportes de inquilinos</h2><span className="owner-properties__pending">{visibleReports.filter(pending).length} pendientes</span></header>
            <div className="owner-properties__report-list">
              {!visibleReports.length && <p className="owner-properties__message">No hay reportes para esta propiedad.</p>}
              {reportPages.pageItems.map((report) => <button className={`owner-properties__report${openReport === report.id ? " is-open" : ""}`} key={report.id} type="button" aria-expanded={openReport === report.id} onClick={() => setOpenReport(openReport === report.id ? null : report.id)}><span className="owner-properties__report-summary">{report.imagenes?.[0]?.url && <img className="owner-properties__report-image" src={api.assetUrl(report.imagenes[0].url)} alt="" />}<span className={`owner-properties__report-dot${pending(report) ? " is-warning" : ""}`} /><strong>{report.titulo}</strong><small>{date(report.fecha)}</small><img className={`owner-properties__report-chevron${openReport === report.id ? " is-open" : ""}`} src={angleDownIcon} alt="" aria-hidden="true" /><span className="owner-properties__report-meta">{report.personaReporta}<br />{report.propiedad}</span></span>{openReport === report.id && <span className="owner-properties__report-detail"><span className="owner-properties__report-gallery">{report.imagenes?.map((image) => <img src={api.assetUrl(image.url)} alt={`Imagen del reporte ${report.titulo}`} key={image.id} />)}</span><span className="owner-properties__report-property">{report.estado}</span><span>Inquilino: {report.personaReporta}</span><span className="owner-properties__report-description"><strong>Descripción:</strong> {report.descripcion || "Sin descripción"}</span></span>}</button>)}
            </div>
            <Pagination page={reportPages.page} totalPages={reportPages.totalPages} total={visibleReports.length} onPageChange={reportPages.setPage} />
          </aside>
        </div>
      )}
    </main>
  );
}
