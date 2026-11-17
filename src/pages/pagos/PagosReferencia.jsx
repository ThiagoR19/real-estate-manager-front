import { useEffect, useState } from "react";
import {
  buildingColumnsIcon,
  calendarIcon,
  checkIcon,
  downloadIcon,
  fileLinesIcon,
  optionsIcon,
  paperPlaneIcon,
  xIcon,
} from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import useHistorialPeriodos, {
  formatearFecha,
  formatearFechaHora,
  formatearMonto,
  nombreMes,
  nombrePeriodo,
} from "../../hooks/useHistorialPeriodos";
import { api } from "../../services/api";
import "./PagosReferencia.css";
import "./PagosMovil.css";

const ESTADOS = {
  Pendiente: {
    texto: "Pendiente",
    tono: "neutral",
    nota: "Subí el comprobante de pago y envialo para que podamos revisarlo.",
  },
  "En revision": { texto: "En revisión", tono: "info", nota: "Estamos revisando tu comprobante." },
  Aprobado: {
    texto: "Aprobado",
    tono: "success",
    nota: "Pago aprobado correctamente. No se requieren acciones adicionales",
  },
  Rechazado: {
    texto: "Rechazado",
    tono: "danger",
    nota: "El comprobante fue rechazado. Revisá los datos y volvé a enviarlo.",
  },
  Anulado: { texto: "Anulado", tono: "neutral", nota: "Este pago fue anulado." },
};
const TONO_DETALLE = { success: "approved", danger: "rejected" };
const PUEDE_ENVIAR = ["Pendiente", "Rechazado"];

function Icono({ src }) {
  return <img className="vista-pago__icon" src={src} alt="" aria-hidden="true" />;
}

function estadoDe(pago) {
  return ESTADOS[pago?.estado] ?? { texto: pago?.estado ?? "—", tono: "neutral", nota: "" };
}

export default function PagosReferencia() {
  const historial = useHistorialPeriodos(api.pagos, api.pago);
  const { items, contratos, contrato, delContrato, anios, detalle: pago } = historial;
  const [openYears, setOpenYears] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const estado = estadoDe(pago);
  const comprobante = pago?.comprobantes?.[0] ?? null;
  const hasReceipt = Boolean(comprobante) || Boolean(pago?.tieneComprobante);
  const puedeEnviar = PUEDE_ENVIAR.includes(pago?.estado) && !historial.cargandoDetalle;
  const motivo = pago?.estado === "Rechazado" && comprobante?.motivoRechazo ? ` Motivo: ${comprobante.motivoRechazo}` : "";
  const nota = [estado.nota + motivo, pago?.detalle].filter(Boolean).join(" ");
  const contar = (condicion) => `${delContrato.filter(condicion).length}/${delContrato.length}`;

  useEffect(() => {
    if (!timelineOpen && !summaryOpen && !receiptOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setTimelineOpen(false);
        setSummaryOpen(false);
        setReceiptOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [timelineOpen, summaryOpen, receiptOpen]);

  function limpiar() {
    setUploadedFile(null);
  }

  function toggleYear(anio, abierto) {
    setOpenYears((current) => ({ ...current, [anio]: !abierto }));
  }

  function chooseProperty(propiedad) {
    historial.elegirContrato(contratos.find((item) => item.propiedad === propiedad).idContrato);
    limpiar();
  }

  function changeProperty(direction) {
    historial.moverContrato(direction);
    limpiar();
  }

  function choosePeriod(id) {
    historial.elegir(id);
    limpiar();
    setTimelineOpen(false);
  }

  function upload(event) {
    const [file] = event.target.files ?? [];
    if (!file) return;
    setUploadedFile(file);
    mostrarAviso({ tipo: "info", titulo: "Comprobante seleccionado", mensaje: "El comprobante está listo para enviarse a revisión." });
    event.target.value = "";
  }

  async function sendForReview() {
    if (!uploadedFile && comprobante?.estado !== "PENDIENTE") {
      mostrarAviso({ tipo: "advertencia", titulo: "Falta el comprobante", mensaje: "Subí el comprobante antes de enviarlo." });
      return;
    }
    setEnviando(true);
    try {
      if (uploadedFile) await api.subirComprobantePago(pago.id, uploadedFile);
      await api.marcarPagoPagado(pago.id);
      setUploadedFile(null);
      mostrarAviso({ tipo: "exito", titulo: "Solicitud enviada", mensaje: "Se envió a revisión el pago seleccionado." });
      historial.recargar();
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo enviar", mensaje: error.message });
    } finally {
      setEnviando(false);
    }
  }

  function downloadReceipt() {
    api.descargarComprobantePago(pago.id, comprobante?.nombreArchivo).catch((error) =>
      mostrarAviso({ tipo: "error", titulo: "No se pudo descargar el comprobante", mensaje: error.message }),
    );
  }

  if (!items || !items.length || !pago) {
    return (
      <main id="vista-pago">
        <p className="vista-pago__feedback pagos__feedback" role="status">
          {items?.length === 0 ? historial.error || "Todavía no tenés pagos registrados." : "Cargando pagos..."}
        </p>
      </main>
    );
  }

  const propertyOptions = contratos.map((item) => item.propiedad);

  return (
    <main id="vista-pago">
      <div className="pago-movil__toolbar">
        <SelectDesplegable
          label="Propiedad"
          placeholder={contrato?.propiedad}
          value={contrato?.propiedad}
          options={propertyOptions}
          onChange={chooseProperty}
          icon={buildingColumnsIcon}
          className="vista-pago__mobile-propiedad-select"
          triggerClassName="vista-pago__mobile-propiedad-trigger"
          iconClassName="vista-pago__mobile-propiedad-icon"
          valueClassName="vista-pago__mobile-propiedad-value"
          chevronClassName="vista-pago__mobile-propiedad-chevron"
          blurOnSelect
        />
        <button
          type="button"
          aria-label="Abrir cronología"
          aria-controls="vista-pago-chronology"
          aria-expanded={timelineOpen}
          onClick={() => {
            setTimelineOpen(true);
            setSummaryOpen(false);
          }}
        >
          <Icono src={optionsIcon} />
        </button>
      </div>
      {timelineOpen && (
        <button
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
        aria-label={summaryOpen ? "Cerrar resumen" : "Abrir resumen de pagos"}
        aria-controls="vista-pago-summary"
        aria-expanded={summaryOpen}
        onClick={() => {
          setSummaryOpen(!summaryOpen);
          setTimelineOpen(false);
        }}
      >
        {summaryOpen ? "‹" : "›"}
      </button>
      <aside
        className={`vista-pago__sidebar pagos__sidebar${timelineOpen ? " is-open" : ""}`}
        id="vista-pago-chronology"
        aria-label="Propiedades y períodos"
      >
        <h1>
          <span className="pago-movil__desktop">Propiedades</span>
          <span className="pago-movil__chronology">Cronología</span>
        </h1>
        <div className="vista-pago__propiedad-row">
          <button type="button" aria-label="Propiedad anterior" onClick={() => changeProperty(-1)}>
            ‹
          </button>
          <SelectDesplegable
            label="Seleccionar propiedad"
            placeholder={contrato?.propiedad}
            value={contrato?.propiedad}
            options={propertyOptions}
            onChange={chooseProperty}
            className="vista-pago__propiedad-select"
            triggerClassName="vista-pago__propiedad-trigger"
            valueClassName="vista-pago__propiedad-value"
            blurOnSelect
            showChevron={false}
          />
          <button type="button" aria-label="Propiedad siguiente" onClick={() => changeProperty(1)}>
            ›
          </button>
        </div>
        <div className="vista-pago__years pagos__years">
          {anios.map(({ anio, periodos }, index) => {
            const abierto = openYears[anio] ?? index === 0;
            return (
              <section className="vista-pago__year pagos__year" key={anio}>
                <button
                  className="vista-pago__year-button"
                  type="button"
                  onClick={() => toggleYear(anio, abierto)}
                  aria-expanded={abierto}
                >
                  <strong>{anio}</strong>
                  <span className={`vista-pago__chevron${abierto ? " is-open" : ""}`} />
                </button>
                {abierto && (
                  <div className="vista-pago__months">
                    {periodos.map((item) => {
                      const { texto, tono } = estadoDe(item);
                      const elegido = item.id === pago?.id;
                      return (
                        <button
                          key={item.id}
                          className={`vista-pago__month vista-pago__month--${tono} pagos__month${elegido ? " is-selected" : ""}`}
                          type="button"
                          onClick={() => choosePeriod(item.id)}
                          aria-pressed={elegido}
                        >
                          <strong>{nombreMes(item.periodo)}</strong>
                          <span className={`vista-pago__status vista-pago__status--${tono}`}>{texto}</span>
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
      <section className="vista-pago__workspace pagos__workspace">
        <section
          className={`vista-pago__summary pagos__summary${summaryOpen ? " is-open" : ""}`}
          id="vista-pago-summary"
          aria-label="Resumen de pagos"
        >
          <article>
            <span className="vista-pago__metric vista-pago__metric--blue">
              <Icono src={fileLinesIcon} />
            </span>
            <strong>Comprobantes enviados</strong>
            <b>{contar((item) => item.tieneComprobante)}</b>
          </article>
          <article>
            <span className="vista-pago__metric vista-pago__metric--green">
              <Icono src={checkIcon} />
            </span>
            <strong>Pagos aprobados</strong>
            <b>{contar((item) => item.estado === "Aprobado")}</b>
          </article>
          <article>
            <span className="vista-pago__metric vista-pago__metric--red">
              <Icono src={xIcon} />
            </span>
            <strong>Pagos rechazados</strong>
            <b>{contar((item) => item.estado === "Rechazado")}</b>
          </article>
        </section>
        <div className="vista-pago__content pagos__content">
          <article className="vista-pago__receipt-column pagos__receipt-column">
            <button className="pago-movil__open-receipt" type="button" onClick={() => setReceiptOpen(true)}>
              <Icono src={fileLinesIcon} />
              {hasReceipt ? "Abrir comprobante" : "Ver comprobante"}
            </button>
            <div
              className={`vista-pago__receipt-frame pagos__receipt-frame is-empty${receiptOpen ? " is-open" : ""}`}
            >
              {receiptOpen && (
                <button
                  className="pago-movil__close"
                  type="button"
                  aria-label="Cerrar comprobante"
                  onClick={() => setReceiptOpen(false)}
                >
                  ×
                </button>
              )}
              <div className="vista-pago__empty-receipt">
                <Icono src={fileLinesIcon} />
                {comprobante ? comprobante.nombreArchivo : hasReceipt ? "Comprobante cargado" : "Sin comprobante"}
              </div>
            </div>
            <div className={`vista-pago__uploaded pagos__uploaded${hasReceipt ? " is-approved" : ""}`}>
              <Icono src={fileLinesIcon} />
              <span>
                <strong>
                  {uploadedFile ? "Comprobante listo para enviar" : hasReceipt ? "Comprobante cargado" : "Cargar comprobante"}
                </strong>
                <small>
                  {uploadedFile
                    ? uploadedFile.name
                    : comprobante
                      ? formatearFechaHora(comprobante.fechaCarga)
                      : "Sin comprobante cargado"}
                </small>
              </span>
            </div>
          </article>
          <section className="vista-pago__detail pagos__detail" aria-labelledby="vista-pago-title">
            <header className="pagos__detail-heading">
              <h1 id="vista-pago-title">{nombrePeriodo(pago.periodo)}</h1>
              <span
                className={`vista-pago__status pagos__status vista-pago__status--${TONO_DETALLE[estado.tono] ?? "info"}`}
              >
                {pago.estado === "Aprobado" && <Icono src={checkIcon} />}
                {estado.texto}
              </span>
            </header>
            <dl className="pagos__facts">
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de pago:</dt>
                <dd>{formatearFecha(pago.fechaPago)}</dd>
              </div>
              <div>
                <Icono src={calendarIcon} />
                <dt>Fecha de aprobación:</dt>
                <dd>{pago.estado === "Aprobado" ? formatearFecha(comprobante?.fechaRevision ?? pago.fechaPago) : "—"}</dd>
              </div>
              <div>
                <span className="vista-pago__coin">$</span>
                <dt>Monto a abonar:</dt>
                <dd>{formatearMonto(pago.monto)}</dd>
              </div>
              <div className="vista-pago__mobile-only pagos__facts-total">
                <span className="vista-pago__coin">$</span>
                <dt>Monto total:</dt>
                <dd>{formatearMonto(pago.monto)}</dd>
              </div>
            </dl>
            <section className="vista-pago__mobile-only pagos__breakdown" aria-label="Detalle del pago">
              <h3>Detalle del pago</h3>
              {pago.conceptos?.length ? (
                pago.conceptos.map((linea) => (
                  <div key={linea.idConcepto}>
                    <span>{linea.nombre}:</span>
                    <b>{formatearMonto(linea.monto)}</b>
                  </div>
                ))
              ) : (
                <p className="vista-pago__breakdown-note">No hay un desglose por concepto disponible para este período.</p>
              )}
            </section>
            <aside className="pagos__admin-note">
              <span>
                <Icono src={fileLinesIcon} />
              </span>
              <div>
                <strong>Observaciones de administración</strong>
                <p>{nota}</p>
              </div>
            </aside>
            <div className="vista-pago__actions pagos__actions">
              {puedeEnviar ? (
                <label className="pagos__button">
                  <Icono src={downloadIcon} />
                  <span>{uploadedFile ? "Cambiar comprobante" : "Subir comprobante"}</span>
                  <input type="file" accept="image/*,.pdf" onChange={upload} />
                </label>
              ) : (
                <Boton className="pagos__button" onClick={downloadReceipt} disabled={!hasReceipt}>
                  <Icono src={downloadIcon} />
                  <span>Descargar comprobante</span>
                </Boton>
              )}
              <Boton
                className="pagos__button"
                icon={paperPlaneIcon}
                text={pago.estado === "En revision" ? "Enviado para revisión" : "Enviar para revisión"}
                onClick={sendForReview}
                disabled={!puedeEnviar || enviando}
              />
            </div>
            <p className="vista-pago__note pagos__disclaimer">
              Nota: Cuando un comprobante es aprobado, ya no puede modificarse.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
