import useListadoPaginado from "../../hooks/useListadoPaginado.js";
import EstadoListado from "../../components/paginacion/EstadoListado.jsx";
import PaginacionServidor from "../../components/paginacion/PaginacionServidor.jsx";
import { assetUrl } from "../../utils/assetUrl.js";
import { useEffect, useState } from "react";
import { angleDownIcon, buildingColumnsIcon, clockIcon, fileLinesIcon, houseIcon, locationDotIcon, peopleIcon, tagIcon, toolboxIcon, userIcon, walletIcon, xIcon } from "../../assets/icons";
import { SelectDesplegable, PildoraResumen, Paginacion, usePaginacion, PROPERTY_PAGE_SIZE, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import { estadoReporte } from "../../utils/estadoReporte.js";
import "./MisPropiedades.css";

const money = (amount, currency) =>
  amount == null
    ? "—"
    : new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "ARS",
    }).format(Number(amount));
const date = (value) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString("es-AR") : "—";
const pending = (report) => report.estado !== "Resuelto";

export default function MisPropiedades() {
  const [catalogos, setCatalogos] = useState({ propiedades: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [openReport, setOpenReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revisionCatalogos, setRevisionCatalogos] = useState(0);
  useEffect(() => {
    let activa = true;
    api.catalogosReportes().then((resultado) => {
      if (activa) { setCatalogos(resultado); setError(""); }
    }).catch((error) => { if (activa) setError(error.message); })
      .finally(() => { if (activa) setLoading(false); });
    return () => { activa = false; };
  }, [revisionCatalogos]);

  // Catálogo resumido autorizado para el propietario; no se reconstruye desde todos los contratos.
  const properties = catalogos.propiedades.map((propiedad) => ({
    id: propiedad.id, name: propiedad.nombre, address: propiedad.ubicacion,
  }));
  const propertyPages = usePaginacion(properties, PROPERTY_PAGE_SIZE);
  const idPropiedad = selectedId ?? properties[0]?.id ?? null;
  const property = properties.find((propiedad) => propiedad.id === idPropiedad);
  const contratosPropiedad = useListadoPaginado(api.contratos, {
    filtros: { idPropiedad }, limite: 1, habilitada: Boolean(idPropiedad),
  });
  const contratoVigente = useListadoPaginado(api.contratos, {
    filtros: { idPropiedad, estado: "Vigente" }, limite: 1, habilitada: Boolean(idPropiedad),
  });
  const contratosVigentes = useListadoPaginado(api.contratos, { filtros: { estado: "Vigente" }, limite: 1 });
  const ventasVigentes = useListadoPaginado(api.contratos, { filtros: { estado: "Vigente", tipo: "Venta" }, limite: 1 });
  const activeContract = contratoVigente.datos[0] ?? contratosPropiedad.datos[0];
  const activeContractId = activeContract?.id;
  const documentos = useListadoPaginado(api.documentosContrato, {
    filtros: { idContrato: activeContractId, tipo: "CONTRATO" }, habilitada: Boolean(activeContractId),
  });
  const visibleDocuments = documentos.datos;
  // La API aún no filtra reportes por propiedad. Este panel muestra el listado global autorizado.
  const listadoReportes = useListadoPaginado(api.reportes);
  const visibleReports = listadoReportes.datos;
  const tenant = activeContract?.participantes?.filter((persona) => persona.rol === "Inquilino")
    .map((persona) => `${persona.nombre} ${persona.apellido}`).join(", ") || "—";

  function cambiarPaginaPropiedades(nextPage) {
    propertyPages.setPage(nextPage);
    setSelectedId(properties[(nextPage - 1) * PROPERTY_PAGE_SIZE]?.id ?? null);
  }

  async function descargarDocumento(document) {
    try {
      await api.descargarDocumento(document);
      mostrarAviso({
        tipo: "info",
        titulo: "Descarga iniciada",
        mensaje: `Se inició la descarga de ${document.titulo}.`,
      });
    } catch (error) {
      mostrarAviso({
        tipo: "error",
        titulo: "No se pudo descargar el documento",
        mensaje: error.message,
      });
    }
  }

  return (
    <main id="propiedades-propietario">
      <section
        className="propiedades-propietario__overview"
        aria-labelledby="propiedades-propietario-title"
      >
        <header className="propiedades-propietario__hero">
          <div>
            <h1 id="propiedades-propietario-title">Tus propiedades</h1>
            <p>Toda la información de tus propiedades</p>
          </div>
        </header>
        <div className="propiedades-propietario__summary" aria-label="Resumen de propiedades">
          <PildoraResumen
            icon={peopleIcon}
            label="Propiedades"
            value={loading || error ? "—" : properties.length}
            tone="success"
          />
          <PildoraResumen
            icon={xIcon}
            label="Reportes pendientes"
            value="—"
            tone="danger"
          />
          <PildoraResumen
            icon={fileLinesIcon}
            label="Contratos vigentes"
            value={contratosVigentes.paginacion?.total ?? "—"}
            tone="info"
          />
          <PildoraResumen
            icon={clockIcon}
            label="Ventas vigentes"
            value={ventasVigentes.paginacion?.total ?? "—"}
            tone="warning"
          />
        </div>
      </section>

      {error && (
        <p className="propiedades-propietario__message" role="alert">
          {error} <button type="button" onClick={() => { setLoading(true); setRevisionCatalogos((actual) => actual + 1); }}>Reintentar</button>
        </p>
      )}
      {loading && (
        <p className="propiedades-propietario__message" role="status">
          Cargando propiedades…
        </p>
      )}
      {!loading && !error && !properties.length && (
        <p className="propiedades-propietario__message">
          No tenés propiedades asociadas a contratos todavía.
        </p>
      )}

      <p className="propiedades-propietario__message">El panel de reportes incluye todas tus propiedades. El total de reportes pendientes aún no está disponible.</p>
      <EstadoListado error={contratosVigentes.error || ventasVigentes.error} alReintentar={() => { contratosVigentes.recargar(); ventasVigentes.recargar(); }} />
      {property && (
        <div className="propiedades-propietario__layout">
          <aside className="propiedades-propietario__list">
            <h2>Propiedades</h2>
            <SelectDesplegable
              label="Seleccionar propiedad"
              value={property.name}
              options={properties.map((item) => item.name)}
              onChange={(name) => {
                const index = properties.findIndex((item) => item.name === name);
                if (index < 0) return;
                setSelectedId(properties[index].id);
                propertyPages.setPage(Math.floor(index / PROPERTY_PAGE_SIZE) + 1);
              }}
              className="propiedades-propietario__propiedad-select"
              triggerClassName="propiedades-propietario__propiedad-trigger"
              valueClassName="propiedades-propietario__propiedad-value"
            />
            {propertyPages.pageItems.map((item, index) => (
              <button
                className={`propiedades-propietario__propiedad${idPropiedad === item.id ? " is-selected" : ""
                  }`}
                type="button"
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                }}
              >
                <img className="propiedades-propietario__icon" src={index === 0 ? houseIcon : buildingColumnsIcon} alt="" aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            ))}
            <Paginacion
              page={propertyPages.page}
              totalPages={propertyPages.totalPages}
              total={properties.length}
              onPageChange={cambiarPaginaPropiedades}
              pageSize={PROPERTY_PAGE_SIZE}
            />
          </aside>

          <section className="propiedades-propietario__detail">
            <header>
              <div>
                <h2>{property.name}</h2>
                <div className="propiedades-propietario__facts">
                  <span>
                    <span className="propiedades-propietario__fact-icon">
                      <img className="propiedades-propietario__icon" src={locationDotIcon} alt="" aria-hidden="true" />
                    </span>
                    Ubicación: {property.address || "—"}
                  </span>
                  <span>
                    <span className="propiedades-propietario__fact-icon">
                      <img className="propiedades-propietario__icon" src={tagIcon} alt="" aria-hidden="true" />
                    </span>
                    Estado: {activeContract?.estado || "—"}
                  </span>
                </div>
              </div>
              <div className="propiedades-propietario__facts propiedades-propietario__facts--right">
                <span>
                  <span className="propiedades-propietario__fact-icon">
                    <img className="propiedades-propietario__icon" src={walletIcon} alt="" aria-hidden="true" />
                  </span>
                  Alquiler: {activeContract?.tipo === "Alquiler"
                    ? money(activeContract.montoAcordado, activeContract.moneda)
                    : "—"}
                </span>
                <span>
                  <span className="propiedades-propietario__fact-icon">
                    <img className="propiedades-propietario__icon" src={userIcon} alt="" aria-hidden="true" />
                  </span>
                  Locatario: {tenant}
                </span>
              </div>
            </header>

            <EstadoListado cargando={contratosPropiedad.cargando || contratoVigente.cargando} error={contratosPropiedad.error || contratoVigente.error} alReintentar={() => { contratosPropiedad.recargar(); contratoVigente.recargar(); }} />
            <div className="propiedades-propietario__document">
              <div>
                <img className="propiedades-propietario__icon" src={fileLinesIcon} alt="" aria-hidden="true" />
                <strong>
                  Contrato {activeContract?.estado?.toLowerCase() || "registrado"}
                </strong>
                <small>
                  {date(activeContract?.fechaInicio)} - {date(activeContract?.fechaFin)}
                </small>
              </div>
              {visibleDocuments.length ? (
                visibleDocuments.map((document) => (
                  <button
                    className="propiedades-propietario__download"
                    type="button"
                    key={document.id}
                    onClick={() => descargarDocumento(document)}
                  >
                    Descargar {document.titulo}
                  </button>
                ))
              ) : (
                !documentos.cargando && !documentos.error && <small>No hay un contrato disponible para descargar.</small>
              )}
            </div>
            <EstadoListado cargando={documentos.cargando} error={documentos.error} alReintentar={documentos.recargar} />
            <PaginacionServidor paginacion={documentos.paginacion} alCambiar={documentos.cambiarPagina} />
            {contratosPropiedad.paginacion?.total > 1 && (
              <p className="propiedades-propietario__message">
                {contratosPropiedad.paginacion.total} contratos asociados a esta propiedad
              </p>
            )}
          </section>

          <aside
            className="propiedades-propietario__reportes"
            aria-labelledby="propiedades-propietario-reportes-title"
          >
            <header>
              <img className="propiedades-propietario__icon" src={toolboxIcon} alt="" aria-hidden="true" />
              <h2 id="propiedades-propietario-reportes-title">Reportes de tus propiedades</h2>
              <span className="propiedades-propietario__pending">
                {listadoReportes.paginacion?.total ?? "—"} reportes
              </span>
            </header>
            <div className="propiedades-propietario__report-list">
              {!listadoReportes.cargando && !listadoReportes.error && !visibleReports.length && (
                <p className="propiedades-propietario__message">
                  No hay reportes para tus propiedades.
                </p>
              )}
              {visibleReports.map((report) => (
                <button
                  className={`propiedades-propietario__report${openReport === report.id ? " is-open" : ""
                    }`}
                  key={report.id}
                  type="button"
                  aria-expanded={openReport === report.id}
                  onClick={() =>
                    setOpenReport(openReport === report.id ? null : report.id)
                  }
                >
                  <span className="propiedades-propietario__report-summary">
                    {report.imagenes?.[0]?.url && (
                      <img
                        className="propiedades-propietario__report-image"
                        src={assetUrl(report.imagenes[0].url)}
                        alt=""
                      />
                    )}
                    <span
                      className={`propiedades-propietario__report-dot${pending(report) ? " is-warning" : ""
                        }`}
                    />
                    <strong>{report.titulo}</strong>
                    <small>{date(report.fecha)}</small>
                    <img
                      className={`propiedades-propietario__report-chevron${openReport === report.id ? " is-open" : ""
                        }`}
                      src={angleDownIcon}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="propiedades-propietario__report-meta">
                      {report.personaReporta}
                      <br />
                      {report.propiedad}
                    </span>
                  </span>
                  {openReport === report.id && (
                    <span className="propiedades-propietario__report-detail">
                      <span className="propiedades-propietario__report-gallery">
                        {report.imagenes?.map((image) => (
                          <img
                            src={assetUrl(image.url)}
                            alt={`Imagen del reporte ${report.titulo}`}
                            key={image.id}
                          />
                        ))}
                      </span>
                      <span className="propiedades-propietario__report-propiedad">
                        {estadoReporte(report.estado)}
                      </span>
                      <span>Inquilino: {report.personaReporta}</span>
                      <span className="propiedades-propietario__report-description">
                        <strong>Descripción:</strong> {report.descripcion || "Sin descripción"}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
<EstadoListado cargando={listadoReportes.cargando} error={listadoReportes.error} alReintentar={listadoReportes.recargar} />
            <PaginacionServidor paginacion={listadoReportes.paginacion} alCambiar={listadoReportes.cambiarPagina} />
          </aside>
        </div>
      )}
    </main>
  );
}
