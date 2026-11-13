import { useEffect, useMemo, useState } from "react";
import {
  angleDownIcon, buildingColumnsIcon, clockIcon, fileLinesIcon, houseIcon,
  locationDotIcon, peopleIcon, tagIcon, toolboxIcon, userIcon, walletIcon, xIcon,
} from "../../assets/icons";
import { SelectDesplegable, PildoraResumen, Paginacion, usePaginacion, PROPERTY_PAGE_SIZE } from "../../components";
import { api } from "../../services/api.js";
import "./MisPropiedades.css";

const money = (amount, currency) => amount == null ? "—" : new Intl.NumberFormat("es-AR", { style: "currency", currency: currency || "ARS" }).format(Number(amount));
const date = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("es-AR") : "—";
const pending = (report) => !/resuelt|cerrad|finalizad/i.test(report.estado || "");

function Icono({ src }) {
  return <img className="propiedades-propietario__icon" src={src} alt="" aria-hidden="true" />;
}

export default function MisPropiedades() {
  const [contracts, setContracts] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [openReport, setOpenReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState({ contractId: null, items: [] });

  useEffect(() => {
    let active = true;
    Promise.all([api.contratos(), api.reportes()])
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
  const propertyPages = usePaginacion(properties, PROPERTY_PAGE_SIZE);
  const property = properties.find((item) => item.id === selectedId);
  const propertyContracts = property?.contracts || [];
  const activeContract = propertyContracts.find((item) => item.estado === "Vigente") || propertyContracts[0];
  const activeContractId = activeContract?.id;
  const visibleDocuments = documents.contractId === activeContractId ? documents.items : [];
  const visibleReports = reports.filter((item) => item.idPropiedad === selectedId);
  const reportPages = usePaginacion(visibleReports);
  const pendingReports = reports.filter((item) => properties.some((propertyItem) => propertyItem.id === item.idPropiedad) && pending(item));
  const tenant = activeContract?.participantes?.filter((item) => item.rol === "Inquilino").map((item) => `${item.nombre} ${item.apellido}`).join(", ") || "—";

  useEffect(() => {
    if (!activeContractId) return undefined;
    let active = true;
    api.documentosContrato(activeContractId)
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
    <main id="propiedades-propietario">
      <section className="propiedades-propietario__overview" aria-labelledby="propiedades-propietario-title">
        <header className="propiedades-propietario__hero"><div><h1 id="propiedades-propietario-title">Tus propiedades</h1><p>Toda la información de tus propiedades</p></div></header>
        <div className="propiedades-propietario__summary" aria-label="Resumen de propiedades">
          <PildoraResumen icon={peopleIcon} label="Propiedades" value={properties.length} tone="success" />
          <PildoraResumen icon={xIcon} label="Reportes pendientes" value={pendingReports.length} tone="danger" />
          <PildoraResumen icon={fileLinesIcon} label="Contratos vigentes" value={contracts.filter((item) => item.estado === "Vigente").length} tone="info" />
          <PildoraResumen icon={clockIcon} label="Propiedades en venta" value={properties.filter((item) => item.contracts.some((contract) => contract.tipo === "Venta" && contract.estado === "Vigente")).length} tone="warning" />
        </div>
      </section>
      {error && <p className="propiedades-propietario__message" role="alert">{error}</p>}
      {loading && <p className="propiedades-propietario__message" role="status">Cargando propiedades…</p>}
      {!loading && !error && !properties.length && <p className="propiedades-propietario__message">No tenés propiedades asociadas a contratos todavía.</p>}
      {property && (
        <div className="propiedades-propietario__layout">
          <aside className="propiedades-propietario__list">
            <h2>Propiedades</h2>
            <SelectDesplegable label="Seleccionar propiedad" value={property.name} options={properties.map((item) => item.name)} onChange={(name) => { const index = properties.findIndex((item) => item.name === name); if (index < 0) return; setSelectedId(properties[index].id); propertyPages.setPage(Math.floor(index / PROPERTY_PAGE_SIZE) + 1); reportPages.resetPage(); }} className="propiedades-propietario__propiedad-select" triggerClassName="propiedades-propietario__propiedad-trigger" valueClassName="propiedades-propietario__propiedad-value" />
            {propertyPages.pageItems.map((item, index) => <button className={`propiedades-propietario__propiedad${selectedId === item.id ? " is-selected" : ""}`} type="button" key={item.id} onClick={() => { setSelectedId(item.id); reportPages.resetPage(); }}><Icono src={index === 0 ? houseIcon : buildingColumnsIcon} /><span>{item.name}</span></button>)}
            <Paginacion page={propertyPages.page} totalPages={propertyPages.totalPages} total={properties.length} onPageChange={changePropertyPage} pageSize={PROPERTY_PAGE_SIZE} />
          </aside>
          <section className="propiedades-propietario__detail">
            <header><div><h2>{property.name}</h2><div className="propiedades-propietario__facts"><span><span className="propiedades-propietario__fact-icon"><Icono src={locationDotIcon} /></span>Ubicación: {property.address || "—"}</span><span><span className="propiedades-propietario__fact-icon"><Icono src={tagIcon} /></span>Estado: {activeContract?.estado || "—"}</span></div></div><div className="propiedades-propietario__facts propiedades-propietario__facts--right"><span><span className="propiedades-propietario__fact-icon"><Icono src={walletIcon} /></span>Alquiler: {activeContract?.tipo === "Alquiler" ? money(activeContract.montoAcordado, activeContract.moneda) : "—"}</span><span><span className="propiedades-propietario__fact-icon"><Icono src={userIcon} /></span>Locatario: {tenant}</span></div></header>
            <div className="propiedades-propietario__document"><div><Icono src={fileLinesIcon} /><strong>Contrato {activeContract?.estado?.toLowerCase() || "registrado"}</strong><small>{date(activeContract?.fechaInicio)} - {date(activeContract?.fechaFin)}</small></div>{visibleDocuments.length ? visibleDocuments.map((document) => <button className="propiedades-propietario__download" type="button" key={document.id} onClick={() => api.descargarDocumento(document).catch((cause) => setError(cause.message))}>Descargar {document.titulo}</button>) : <small>No hay un contrato disponible para descargar.</small>}</div>
            {propertyContracts.length > 1 && <p className="propiedades-propietario__message">{propertyContracts.length} contratos asociados a esta propiedad</p>}
          </section>
          <aside className="propiedades-propietario__reportes" aria-labelledby="propiedades-propietario-reportes-title">
            <header><Icono src={toolboxIcon} /><h2 id="propiedades-propietario-reportes-title">Reportes de inquilinos</h2><span className="propiedades-propietario__pending">{visibleReports.filter(pending).length} pendientes</span></header>
            <div className="propiedades-propietario__report-list">
              {!visibleReports.length && <p className="propiedades-propietario__message">No hay reportes para esta propiedad.</p>}
              {reportPages.pageItems.map((report) => <button className={`propiedades-propietario__report${openReport === report.id ? " is-open" : ""}`} key={report.id} type="button" aria-expanded={openReport === report.id} onClick={() => setOpenReport(openReport === report.id ? null : report.id)}><span className="propiedades-propietario__report-summary">{report.imagenes?.[0]?.url && <img className="propiedades-propietario__report-image" src={api.urlRecurso(report.imagenes[0].url)} alt="" />}<span className={`propiedades-propietario__report-dot${pending(report) ? " is-warning" : ""}`} /><strong>{report.titulo}</strong><small>{date(report.fecha)}</small><img className={`propiedades-propietario__report-chevron${openReport === report.id ? " is-open" : ""}`} src={angleDownIcon} alt="" aria-hidden="true" /><span className="propiedades-propietario__report-meta">{report.personaReporta}<br />{report.propiedad}</span></span>{openReport === report.id && <span className="propiedades-propietario__report-detail"><span className="propiedades-propietario__report-gallery">{report.imagenes?.map((image) => <img src={api.urlRecurso(image.url)} alt={`Imagen del reporte ${report.titulo}`} key={image.id} />)}</span><span className="propiedades-propietario__report-propiedad">{report.estado}</span><span>Inquilino: {report.personaReporta}</span><span className="propiedades-propietario__report-description"><strong>Descripción:</strong> {report.descripcion || "Sin descripción"}</span></span>}</button>)}
            </div>
            <Paginacion page={reportPages.page} totalPages={reportPages.totalPages} total={visibleReports.length} onPageChange={reportPages.setPage} />
          </aside>
        </div>
      )}
    </main>
  );
}
