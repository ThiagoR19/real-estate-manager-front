import { useEffect, useRef, useState } from "react";
import { buildingColumnsIcon, calendarIcon, checkIcon, downloadIcon, fileLinesIcon, imageIcon, optionsIcon, paperPlaneIcon, xIcon, } from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import useHistorialPeriodos, { formatearFecha, formatearFechaHora, formatearMonto, nombreMes, nombrePeriodo } from "../../hooks/useHistorialPeriodos";
import { cobro, cobros, descargarComprobanteCobro, obtenerComprobanteCobro, solicitarRevisionCobro } from "../../services/cobros";
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
  const historial = useHistorialPeriodos(cobros, cobro);
  const { items, contratos, contrato, delContrato, anios, detalle: cobroSeleccionado } = historial;
  const [openYears, setOpenYears] = useState({});
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dialogo, setDialogo] = useState(null);
  const abrirCronologia = useRef(null);
  const cerrarCronologia = useRef(null);
  const estado = estadoDe(cobroSeleccionado);
  const hasReceipt = Boolean(cobroSeleccionado?.tieneComprobante);
  const comprobante = { cargar: obtenerComprobanteCobro, id: cobroSeleccionado?.id, nombre: cobroSeleccionado?.nombreArchivo, version: cobroSeleccionado?.fechaComprobante };
  const contar = (condicion) => `${delContrato.filter(condicion).length}/${delContrato.length}`;

  useEffect(() => {
    if (!timelineOpen && !summaryOpen) return undefined;
    function cerrarConEscape(event) {
      if (event.key === "Escape") {
        setTimelineOpen(false);
        setSummaryOpen(false);
      }
    }
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [timelineOpen, summaryOpen]);

  useEffect(() => {
    if (!timelineOpen) return;
    const boton = abrirCronologia.current;
    cerrarCronologia.current?.focus();
    return () => boton?.focus();
  }, [timelineOpen]);

  function elegirPropiedad(etiqueta) {
    historial.elegirContrato(contratos.find((item) => item.etiqueta === etiqueta).idContrato);
  }

  function cambiarPropiedad(direction) {
    historial.moverContrato(direction);
  }

  function elegirPeriodo(id) {
    historial.elegir(id);
    setTimelineOpen(false);
  }

  function alternarAnio(anio, abierto) {
    setOpenYears((current) => ({ ...current, [anio]: !abierto }));
  }

  function descargarComprobante() {
    descargarComprobanteCobro(cobroSeleccionado.id, cobroSeleccionado.nombreArchivo).catch((error) =>
      mostrarAviso({ tipo: "error", titulo: "No se pudo descargar el comprobante", mensaje: error.message }),
    );
  }

  if (!items || !items.length || !cobroSeleccionado) {
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
          onChange={elegirPropiedad}
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
          <button type="button" aria-label="Propiedad anterior" onClick={() => cambiarPropiedad(-1)}>
            ‹
          </button>
          <SelectDesplegable
            label="Seleccionar propiedad"
            placeholder={contrato?.etiqueta}
            value={contrato?.etiqueta}
            options={propertyOptions}
            onChange={elegirPropiedad}
            className="cobros__propiedad-select"
            triggerClassName="cobros__propiedad-trigger"
            valueClassName="cobros__propiedad-value"
            showChevron={false}
            blurOnSelect
          />
          <button type="button" aria-label="Propiedad siguiente" onClick={() => cambiarPropiedad(1)}>
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
                  onClick={() => alternarAnio(clave, abierto)}
                  aria-expanded={abierto}
                >
                  <strong>{anio}</strong>
                  <span className={`cobros__chevron${abierto ? " is-open" : ""}`} />
                </button>
                {abierto && (
                  <div className="cobros__months">
                    {periodos.map((item) => {
                      const { texto, tono } = estadoDe(item);
                      const elegido = item.id === cobroSeleccionado.id;
                      return (
                        <button
                          className={`cobros__month cobros__month--${tono}${elegido ? " is-selected" : ""}`}
                          type="button"
                          key={item.id}
                          onClick={() => elegirPeriodo(item.id)}
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
            value={formatearMonto(cobroSeleccionado.montoNeto)}
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
                  {hasReceipt && formatearFechaHora(cobroSeleccionado.fechaComprobante)}
                  {!hasReceipt && cobroSeleccionado.estado === "Pendiente" && "Esperando la transferencia de la inmobiliaria"}
                </small>
              </span>
            </div>
          </article>

          <article className="cobros__detail" aria-labelledby="cobros-title">
            <header className="cobros__detail-heading">
              <h2 id="cobros-title">{nombrePeriodo(cobroSeleccionado.periodo)}</h2>
              <span className={`cobros__status cobros__status--${estado.tono}`}>
                {cobroSeleccionado.estado === "Liquidado" && <Icono src={checkIcon} />}
                {estado.texto}
              </span>
            </header>
            <div className="cobros__financials">
              <div className="cobros__facts">
                <div>
                  <span className="cobros__round-symbol" aria-hidden="true"><Icono src={calendarIcon} /></span>
                  <strong>Fecha de cobro:</strong>
                  <b>{formatearFecha(cobroSeleccionado.fechaPagoInquilino)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol" aria-hidden="true"><Icono src={calendarIcon} /></span>
                  <strong>Fecha de liquidación:</strong>
                  <b>{formatearFecha(cobroSeleccionado.fechaCobro)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto cobrado:</strong>
                  <b>{formatearMonto(cobroSeleccionado.montoBruto)}</b>
                </div>
                <div>
                  <span className="cobros__round-symbol">%</span>
                  <strong>Comisión inmobiliaria:</strong>
                  <b>{cobroSeleccionado.comision ? `-${formatearMonto(cobroSeleccionado.comision)}` : formatearMonto(0)}</b>
                </div>
                <div className="cobros__facts-total">
                  <span className="cobros__round-symbol">$</span>
                  <strong>Monto total{cobroSeleccionado.moneda ? ` (${cobroSeleccionado.moneda})` : ""}:</strong>
                  <b>{formatearMonto(cobroSeleccionado.montoNeto)}</b>
                </div>
              </div>

              <section className="cobros__breakdown" aria-label="Detalle del cobro">
                <h3>Detalle del cobro</h3>
                {historial.cargandoDetalle ? (
                  <p role="status">Cargando detalle…</p>
                ) : historial.errorDetalle ? (
                  <button type="button" onClick={historial.recargar}>Reintentar detalle</button>
                ) : cobroSeleccionado.conceptos?.length ? (
                  cobroSeleccionado.conceptos.map((linea) => (
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
            {cobroSeleccionado.detalle && (
              <aside className="cobros__admin-note">
                <span><Icono src={fileLinesIcon} /></span>
                <div><strong>Detalle de administración</strong><p>{cobroSeleccionado.detalle}</p></div>
              </aside>
            )}
            <div className="cobros__actions">
              {hasReceipt && (
                <Boton className="cobros__download" onClick={descargarComprobante}>
                  <Icono src={downloadIcon} />
                  <span>Descargar comprobante</span>
                </Boton>
              )}
              {cobroSeleccionado.estado === "Liquidado" && (
                <Boton className="cobros__review" icon={paperPlaneIcon} text="Solicitar revisión" onClick={() => setDialogo("revision")} />
              )}
            </div>
            {cobroSeleccionado.estado === "Liquidado" && hasReceipt && (
              <p className="cobros__note">El comprobante queda disponible para consultas y descarga.</p>
            )}
          </article>
        </div>
      </section>
      {dialogo === "comprobante" && <DialogoComprobante {...comprobante} onCerrar={() => setDialogo(null)} />}
      {dialogo === "revision" && (
        <DialogoRevision periodo={nombrePeriodo(cobroSeleccionado.periodo)} solicitar={solicitarRevisionCobro} id={cobroSeleccionado.id} onCerrar={() => setDialogo(null)} />
      )}
    </main>
  );
}
