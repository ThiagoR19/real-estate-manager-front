import { useEffect, useRef, useState } from "react";
import { buildingColumnsIcon, calendarIcon, checkIcon, downloadIcon, fileLinesIcon, imageIcon, optionsIcon, paperPlaneIcon, xIcon, } from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import useHistorialPeriodos, { formatearFecha, formatearFechaHora, formatearMonto, nombreMes, nombrePeriodo } from "../../hooks/useHistorialPeriodos";
import { cobro as obtenerCobro, cobros as listarCobros, descargarComprobanteCobro, obtenerComprobanteCobro, solicitarRevisionCobro } from "../../services/cobros";
import { DialogoComprobante, DialogoRevision, VistaComprobante } from "../pagos/Comprobante";
import "../pagos/PagosMovil.css";
import "./Cobros.css";

const ESTADOS = {
  Pendiente: { texto: "En proceso", tono: "info" },
  Liquidado: { texto: "Cobrado", tono: "success" },
  Anulado: { texto: "Anulado", tono: "neutral" },
};

function Icono({ src }) {
  return <img className="cobros__icon" src={src} alt="" aria-hidden="true" />;
}

function TarjetaResumen({ icon, label, value, tone }) {
  return (
    <article className={`cobros__summary-card cobros__summary-card--${tone}`}>
      <span className="cobros__summary-icon">
        <Icono src={icon} />
      </span>
      <strong>{label}</strong>
      <b>{value}</b>
    </article>
  );
}

function estadoDe(cobro) {
  return ESTADOS[cobro?.estado] ?? { texto: cobro?.estado ?? "—", tono: "neutral" };
}

export default function Cobros() {
  const historial = useHistorialPeriodos(listarCobros, obtenerCobro);
  const { items, contratos, contrato, delContrato, anios, detalle: cobro } = historial;
  const [openYears, setOpenYears] = useState({});
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dialogo, setDialogo] = useState(null);
  const abrirCronologia = useRef(null);
  const cerrarCronologia = useRef(null);
  const estado = estadoDe(cobro);
  const hasReceipt = Boolean(cobro?.tieneComprobante);
  const comprobante = { cargar: obtenerComprobanteCobro, id: cobro?.id, nombre: cobro?.nombreArchivo, version: cobro?.fechaComprobante };
  const contar = (condicion) => `${delContrato.filter(condicion).length}/${delContrato.length}`;

  useEffect(() => {
    if (!timelineOpen && !summaryOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setTimelineOpen(false);
        setSummaryOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [timelineOpen, summaryOpen]);

  useEffect(() => {
    if (!timelineOpen) return;
    const boton = abrirCronologia.current;
    cerrarCronologia.current?.focus();
    return () => boton?.focus();
  }, [timelineOpen]);

  function chooseProperty(etiqueta) {
    historial.elegirContrato(contratos.find((item) => item.etiqueta === etiqueta).idContrato);
  }

  function changeProperty(direction) {
    historial.moverContrato(direction);
  }

  function choosePeriod(id) {
    historial.elegir(id);
    setTimelineOpen(false);
  }

  function toggleYear(anio, abierto) {
    setOpenYears((current) => ({ ...current, [anio]: !abierto }));
  }

  function downloadReceipt() {
    descargarComprobanteCobro(cobro.id, cobro.nombreArchivo).catch((error) =>
      mostrarAviso({ tipo: "error", titulo: "No se pudo descargar el comprobante", mensaje: error.message }),
    );
  }

  if (!items || !items.length || !cobro) {
    return (
      <main id="cobros" className="cobros--sin-periodos">
        <section className="cobros__empty-page">
          <h1>Zona de cobro</h1>
          <p role="status">{historial.error || (items ? "Todavía no tenés liquidaciones registradas." : "Cargando cobros…")}</p>
          {historial.error && <Boton text="Reintentar" onClick={historial.recargar} />}
        </section>
      </main>
    );
  }

  const propertyOptions = contratos.map((item) => item.etiqueta);

  return (
    <main id="cobros">
      <div className="pago-movil__toolbar">
        <SelectDesplegable
          label="Propiedad"
          placeholder={contrato?.etiqueta}
          value={contrato?.etiqueta}
          options={propertyOptions}
          onChange={chooseProperty}
          icon={buildingColumnsIcon}
          className="cobros__mobile-propiedad-select"
          triggerClassName="cobros__mobile-propiedad-trigger"
          iconClassName="cobros__mobile-propiedad-icon"
          valueClassName="cobros__mobile-propiedad-value"
          chevronClassName="cobros__mobile-propiedad-chevron"
          blurOnSelect
        />
        <button
          ref={abrirCronologia}
          type="button"
          aria-label="Abrir cronología"
          aria-controls="cobros-chronology"
          aria-expanded={timelineOpen}
          onClick={() => {
            setTimelineOpen(true);
            setSummaryOpen(false);
          }}
        >
          <Icono src={optionsIcon} />
        </button>
      </div>
      {(timelineOpen || summaryOpen) && (
        <button
          className="pago-movil__fondo"
          type="button"
          aria-label="Cerrar panel"
          onClick={() => { setTimelineOpen(false); setSummaryOpen(false); }}
        />
      )}
      {timelineOpen && (
        <button
          ref={cerrarCronologia}
          className="pago-movil__close"
          type="button"
          aria-label="Cerrar cronología"
          onClick={() => setTimelineOpen(false)}
        >
          ×
        </button>
      )}
      <button
        className={`pago-movil__summary-toggle${summaryOpen ? " is-open" : ""}`}
        type="button"
        aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de cobros"}
        aria-controls="cobros-summary"
        aria-expanded={summaryOpen}
        onClick={() => {
          setSummaryOpen(!summaryOpen);
          setTimelineOpen(false);
        }}
      >
        {summaryOpen ? "‹" : "›"}
      </button>
      <aside
        className={`cobros__sidebar${timelineOpen ? " is-open" : ""}`}
        id="cobros-chronology"
        aria-label="Propiedades y períodos de cobro"
      >
        <h1>
          <span className="pago-movil__desktop">Propiedades</span>
          <span className="pago-movil__chronology">Cronología</span>
        </h1>
        <div className="cobros__propiedad-row">
          <button type="button" aria-label="Propiedad anterior" onClick={() => changeProperty(-1)}>
            ‹
          </button>
          <SelectDesplegable
            label="Seleccionar propiedad"
            placeholder={contrato?.etiqueta}
            value={contrato?.etiqueta}
            options={propertyOptions}
            onChange={chooseProperty}
            className="cobros__propiedad-select"
            triggerClassName="cobros__propiedad-trigger"
            valueClassName="cobros__propiedad-value"
            showChevron={false}
            blurOnSelect
          />
          <button type="button" aria-label="Propiedad siguiente" onClick={() => changeProperty(1)}>
            ›
          </button>
        </div>
        <div className="cobros__years">
          {anios.map(({ anio, periodos }, index) => {
            const clave = `${contrato.idContrato}|${anio}`;
            const abierto = openYears[clave] ?? index === 0;
            return (
              <section className="cobros__year" key={anio}>
                <button
                  className="cobros__year-toggle"
                  type="button"
                  onClick={() => toggleYear(clave, abierto)}
                  aria-expanded={abierto}
                >
                  <strong>{anio}</strong>
                  <span className={`cobros__chevron${abierto ? " is-open" : ""}`} />
                </button>
                {abierto && (
                  <div className="cobros__months">
                    {periodos.map((item) => {
                      const { texto, tono } = estadoDe(item);
                      const elegido = item.id === cobro.id;
                      return (
                        <button
                          className={`cobros__month cobros__month--${tono}${elegido ? " is-selected" : ""}`}
                          type="button"
                          key={item.id}
                          onClick={() => choosePeriod(item.id)}
                          aria-pressed={elegido}
                        >
                          <strong>{nombreMes(item.periodo)}</strong>
                          <span className={`cobros__status cobros__status--${tono}`}>{texto}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </aside>

      <section className="cobros__workspace">
        <section
          className={`cobros__summary${summaryOpen ? " is-open" : ""}`}
          id="cobros-summary"
          aria-label="Resumen de cobros"
        >
          <TarjetaResumen
            icon={fileLinesIcon}
            label="Total del período"
            value={formatearMonto(cobro.montoNeto)}
            tone="blue"
          />
          <TarjetaResumen
            icon={checkIcon}
            label="Liquidaciones cobradas"
            value={contar((item) => item.estado === "Liquidado")}
            tone="green"
          />
          <TarjetaResumen
            icon={xIcon}
            label="Liquidaciones pendientes"
            value={contar((item) => item.estado === "Pendiente")}
            tone="red"
          />
        </section>

        <div className="cobros__content">
          <article className="cobros__receipt-column">
            {hasReceipt && (
              <button className="pago-movil__open-receipt" type="button" onClick={() => setDialogo("comprobante")}>
                <Icono src={imageIcon} />
                Abrir comprobante
              </button>
            )}
            <div className="cobros__receipt-frame">
              {hasReceipt ? (
                <VistaComprobante {...comprobante} onAbrir={() => setDialogo("comprobante")} />
              ) : (
                <div className="cobros__empty-receipt"><Icono src={fileLinesIcon} />Sin comprobante</div>
              )}
            </div>
            <div className={`cobros__receipt-status${hasReceipt ? " is-approved" : ""}`}>
              <Icono src={fileLinesIcon} />
              <span>
                <strong>{hasReceipt ? "Comprobante cargado" : "Sin comprobante cargado"}</strong>
                <small>
                  {hasReceipt && formatearFechaHora(cobro.fechaComprobante)}
                  {!hasReceipt && cobro.estado === "Pendiente" && "Esperando la transferencia de la inmobiliaria"}
                </small>
              </span>
            </div>
          </article>

          <article className="cobros__detail" aria-labelledby="cobros-title">
            <header className="cobros__detail-heading">
              <h2 id="cobros-title">{nombrePeriodo(cobro.periodo)}</h2>
              <span className={`cobros__status cobros__status--${estado.tono}`}>
                {cobro.estado === "Liquidado" && <Icono src={checkIcon} />}
                {estado.texto}
              </span>
            </header>
            <div className="cobros__financials">
              <div className="cobros__facts">
                <div>
                  <span className="cobros__round-symbol" aria-hidden="true"><Icono src={calendarIcon} /></span>
                  <strong>Fecha de cobro:</strong>
                  <b>{formatearFecha(cobro.fechaPagoInquilino)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol" aria-hidden="true"><Icono src={calendarIcon} /></span>
                  <strong>Fecha de liquidación:</strong>
                  <b>{formatearFecha(cobro.fechaCobro)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto cobrado:</strong>
                  <b>{formatearMonto(cobro.montoBruto)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">%</span>
                  <strong>Comisión inmobiliaria:</strong>
                  <b>{cobro.comision ? `-${formatearMonto(cobro.comision)}` : formatearMonto(0)}</b>
                </div>
                <div className="cobros__facts-total">
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto total{cobro.moneda ? ` (${cobro.moneda})` : ""}:</strong>
                  <b>{formatearMonto(cobro.montoNeto)}</b>
                </div>
              </div>

              <section className="cobros__breakdown" aria-label="Detalle del cobro">
                <h3>Detalle del cobro</h3>
                {historial.cargandoDetalle ? (
                  <p role="status">Cargando detalle…</p>
                ) : historial.errorDetalle ? (
                  <button type="button" onClick={historial.recargar}>Reintentar detalle</button>
                ) : cobro.conceptos?.length ? (
                  cobro.conceptos.map((linea) => (
                    <div key={linea.idConcepto}>
                      <span>{linea.nombre}:</span>
                      <b>{formatearMonto(linea.monto)}</b>
                    </div>
                  ))
                ) : (
                  <div>
                    <span>Sin desglose por concepto</span>
                  </div>
                )}
              </section>
            </div>
            {cobro.detalle && (
              <aside className="cobros__admin-note">
                <span><Icono src={fileLinesIcon} /></span>
                <div><strong>Detalle de administración</strong><p>{cobro.detalle}</p></div>
              </aside>
            )}
            <div className="cobros__actions">
              {hasReceipt && (
                <Boton className="cobros__download" onClick={downloadReceipt}>
                  <Icono src={downloadIcon} />
                  <span>Descargar comprobante</span>
                </Boton>
              )}
              {cobro.estado === "Liquidado" && (
                <Boton className="cobros__review" icon={paperPlaneIcon} text="Solicitar revisión" onClick={() => setDialogo("revision")} />
              )}
            </div>
            {cobro.estado === "Liquidado" && hasReceipt && (
              <p className="cobros__note">El comprobante queda disponible para consultas y descarga.</p>
            )}
          </article>
        </div>
      </section>
      {dialogo === "comprobante" && <DialogoComprobante {...comprobante} onCerrar={() => setDialogo(null)} />}
      {dialogo === "revision" && (
        <DialogoRevision periodo={nombrePeriodo(cobro.periodo)} solicitar={solicitarRevisionCobro} id={cobro.id} onCerrar={() => setDialogo(null)} />
      )}
    </main>
  );
}
