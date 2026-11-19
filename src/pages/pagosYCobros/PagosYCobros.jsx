import { useEffect, useState } from "react";
import {
  angleDownIcon,
  checkIcon,
  circleInfoIcon,
  fileLinesIcon,
  imageIcon,
  paperPlaneIcon,
  plusIconWhite,
  xIcon,
} from "../../assets/icons";
import { PanelDeslizable, mostrarAviso } from "../../components";
import useConsultaMedia from "../../hooks/useConsultaMedia";
import usePagosYCobros, {
  CONCEPTO_ALQUILER,
  calcularLiquidacion,
  estaIncluida,
  parseAmount,
} from "../../hooks/usePagosYCobros";
import { obtenerComprobanteCobro } from "../../services/cobros";
import { TIPOS_COMPROBANTE, obtenerComprobantePago, validarComprobante } from "../../services/pagos";
import { DialogoComprobante } from "../pagos/Comprobante";
import "./PagosYCobros.css";

const GRUPOS = [
  { tipo: "Locatario", titulo: "Locatarios" },
  { tipo: "Propietario", titulo: "Propietarios" },
];

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = [ANIO_ACTUAL - 1, ANIO_ACTUAL, ANIO_ACTUAL + 1];
const ESTADOS_PAGO = { "En revision": "En revisión" };

function Icono({ src }) {
  return <img className="pagos-agente__icon" src={src} alt="" aria-hidden="true" />;
}

function Chevron({ open }) {
  return (
    <img
      className={`pagos-agente__chevron${open ? " is-open" : ""}`}
      src={angleDownIcon}
      alt=""
      aria-hidden="true"
    />
  );
}

function formatCurrency(value, moneda = "ARS") {
  return Number(value).toLocaleString("es-AR", { style: "currency", currency: moneda, minimumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return "-";
  const [anio, mes, dia] = String(value).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function formatPeriodo(periodo) {
  const [anio, mes] = periodo.split("-").map(Number);
  return `${MESES[mes - 1]} ${anio}`;
}

function soloNumeros(valor) {
  return valor.replace(/[^\d.,-]/g, "");
}

function normalizar(texto) {
  return texto.toLocaleLowerCase("es-AR").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function BotonDecision({ type, children, onClick, active, neutral, disabled }) {
  return (
    <button
      className={`pagos-agente__decision pagos-agente__decision--${neutral ? "neutral" : type}${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      <span className="pagos-agente__decision-icon">
        <Icono src={type === "approved" ? checkIcon : xIcon} />
      </span>
      <span>{children}</span>
    </button>
  );
}

function PanelPersonas({ personas, query, persona, idContrato, onSelect, guardando }) {
  const [openGroup, setOpenGroup] = useState(persona?.tipo ?? "Locatario");
  const [openPerson, setOpenPerson] = useState(persona?.id ?? "");
  const buscando = query.trim() !== "";
  const termino = normalizar(query.trim());

  const visibles = personas
    .map((item) => {
      if (!buscando || normalizar(item.nombre).includes(termino)) return item;
      const contratos = item.contratos.filter((contrato) => normalizar(contrato.propiedad).includes(termino));
      return contratos.length ? { ...item, contratos } : null;
    })
    .filter(Boolean);

  return (
    <div className="pagos-agente__people-panel">
      <h2 className="pagos-agente__people-title">Personas</h2>
      {GRUPOS.map((grupo) => {
        const grupoAbierto = buscando || openGroup === grupo.tipo;
        const integrantes = visibles.filter((item) => item.tipo === grupo.tipo);
        return (
          <div className="pagos-agente__people-group" key={grupo.tipo}>
            <button
              className="pagos-agente__group-toggle"
              type="button"
              onClick={() => setOpenGroup((actual) => (actual === grupo.tipo ? "" : grupo.tipo))}
              aria-expanded={grupoAbierto}
            >
              {grupo.titulo}
              <Chevron open={grupoAbierto} />
            </button>
            {grupoAbierto && (
              <ul className="pagos-agente__people-list">
                {integrantes.map((item) => {
                  const personaAbierta = buscando || openPerson === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        className={`pagos-agente__person${persona?.id === item.id ? " is-selected" : ""}`}
                        type="button"
                        onClick={() => setOpenPerson((actual) => (actual === item.id ? "" : item.id))}
                        aria-expanded={personaAbierta}
                      >
                        <span>{item.nombre}</span>
                        <Chevron open={personaAbierta} />
                      </button>
                      {personaAbierta && (
                        <ul className="pagos-agente__properties-list">
                          {item.contratos.map((contrato) => {
                            const elegido = persona?.id === item.id && idContrato === contrato.idContrato;
                            return (
                              <li key={contrato.idContrato}>
                                <button
                                  className={`pagos-agente__property-option${elegido ? " is-selected" : ""}`}
                                  type="button"
                                  onClick={() => onSelect(item, contrato)}
                                  disabled={guardando}
                                  aria-current={elegido ? "true" : undefined}
                                >
                                  {contrato.propiedad}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
                {!integrantes.length && <li className="pagos-agente__people-empty">No se encontraron personas.</li>}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ColaRevision({ pendientes, idSeleccionado, onSelect, onRefresh, ocupado }) {
  const { items, error } = pendientes ?? {};

  return (
    <details className="pagos-agente__queue" open>
      <summary>
        <span>Pagos pendientes de revisión</span>
        {items && !error && <span className="pagos-agente__queue-count">{items.length}</span>}
      </summary>
      <div className="pagos-agente__queue-body">
        {items?.length ? (
          <ul>
            {items.map((pago) => (
              <li key={pago.id}>
                <button
                  type="button"
                  onClick={() => onSelect(pago.id)}
                  disabled={ocupado}
                  aria-current={idSeleccionado === pago.id || undefined}
                >
                  <strong>{pago.nombre} {pago.apellido}</strong>
                  <span>{pago.propiedad} · {formatPeriodo(pago.periodo)}</span>
                  <span className="pagos-agente__queue-action">Revisar</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status">
            {!pendientes ? "Cargando pagos…" : error || "No hay pagos pendientes de revisión."}
          </p>
        )}
        <button className="pagos-agente__queue-refresh" type="button" disabled={!pendientes} onClick={onRefresh}>
          Actualizar
        </button>
      </div>
    </details>
  );
}

function FormularioRechazo({ guardando, onCancelar, onRechazar }) {
  const [motivo, setMotivo] = useState("");

  async function confirmar(event) {
    event.preventDefault();
    if (motivo.trim().length < 3 || guardando) return;
    if (await onRechazar(motivo.trim())) onCancelar();
  }

  return (
    <form className="pagos-agente__new-concept pagos-agente__rejection" onSubmit={confirmar}>
      <label>
        <span>Motivo del rechazo</span>
        <input
          autoFocus
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          required
          minLength={3}
          maxLength={500}
          disabled={guardando}
        />
      </label>
      <div>
        <button type="button" disabled={guardando} onClick={onCancelar}>Cancelar</button>
        <button type="submit" disabled={guardando || motivo.trim().length < 3}>Confirmar rechazo</button>
      </div>
    </form>
  );
}

function PanelRevisionPago({ revision, guardando, onVolver, onAprobar, onRechazar }) {
  const [rechazando, setRechazando] = useState(false);
  const [comprobanteAbierto, setComprobanteAbierto] = useState(false);
  const pago = revision?.pago;
  const comprobante = pago?.comprobantes?.[0];
  const enRevision = pago?.estado === "En revision";
  const moneda = pago?.moneda;
  const mostrarImporte = moneda ? (monto) => formatCurrency(monto, moneda) : (monto) =>
    Number(monto).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="pagos-agente__review" aria-label="Detalle del pago en revisión" aria-busy={!revision}>
      <button className="pagos-agente__queue-refresh" type="button" disabled={guardando} onClick={onVolver}>
        Volver a la gestión por persona
      </button>
      {!pago ? (
        <p role="status">{revision?.error || "Cargando detalle…"}</p>
      ) : (
        <>
          <div className="pagos-agente__review-heading">
            <div>
              <h2>{pago.nombre} {pago.apellido}</h2>
              <p>{pago.propiedad} · {formatPeriodo(pago.periodo)}</p>
              <p role="status">Estado: {ESTADOS_PAGO[pago.estado] ?? pago.estado}</p>
            </div>
            {enRevision && (
              <div className="pagos-agente__decisions">
                <BotonDecision type="rejected" disabled={guardando} onClick={() => setRechazando(true)}>
                  Rechazar pago
                </BotonDecision>
                <BotonDecision type="approved" disabled={guardando} onClick={onAprobar}>
                  Aprobar pago
                </BotonDecision>
              </div>
            )}
          </div>
          {rechazando && enRevision && (
            <FormularioRechazo
              guardando={guardando}
              onRechazar={onRechazar}
              onCancelar={() => setRechazando(false)}
            />
          )}
          <div className="pagos-agente__review-detail">
            <dl>
              {pago.fechaPago && <div><dt>Fecha de pago</dt><dd>{formatDate(pago.fechaPago)}</dd></div>}
              {pago.conceptos?.map(({ idConcepto, nombre, monto }) => (
                <div key={idConcepto}><dt>{nombre}</dt><dd>{mostrarImporte(monto)}</dd></div>
              ))}
              <div><dt>Monto total</dt><dd><strong>{mostrarImporte(pago.monto)}</strong></dd></div>
            </dl>
            {pago.detalle && <p>{pago.detalle}</p>}
            {comprobante?.motivoRechazo && pago.estado === "Rechazado" && (
              <p>Motivo del rechazo: {comprobante.motivoRechazo}</p>
            )}
            {comprobante ? (
              <button
                className="pagos-agente__review-receipt"
                type="button"
                onClick={() => setComprobanteAbierto(true)}
              >
                <Icono src={fileLinesIcon} />
                Abrir comprobante
              </button>
            ) : <p>Sin comprobante</p>}
          </div>
          {comprobanteAbierto && comprobante && (
            <DialogoComprobante
              cargar={obtenerComprobantePago}
              id={pago.id}
              nombre={comprobante.nombreArchivo}
              version={comprobante.id}
              onCerrar={() => setComprobanteAbierto(false)}
            />
          )}
        </>
      )}
    </section>
  );
}

export default function PagosYCobros() {
  const esMovil = useConsultaMedia("(max-width: 1024px)");
  const datos = usePagosYCobros();
  const { personas, persona, contrato, detalle, cargando, guardando, error, pendientes, idRevision, revision } = datos;
  const [query, setQuery] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [adding, setAdding] = useState("");
  const [newConcept, setNewConcept] = useState({ label: "", amount: "" });
  const [rechazando, setRechazando] = useState(false);
  const [comprobanteAbierto, setComprobanteAbierto] = useState(false);

  useEffect(() => {
    const alBuscar = (evento) => setQuery(evento.detail ?? "");
    window.addEventListener("personas-search", alBuscar);
    return () => window.removeEventListener("personas-search", alBuscar);
  }, []);

  const esLocatario = persona?.tipo === "Locatario";
  const enRevision = detalle?.estado === "En revision";
  const bloqueado = !detalle?.editable || cargando || guardando;
  const moneda = detalle?.contrato?.moneda ?? "ARS";
  const alquiler = detalle?.lineas.find((linea) => linea.nombre === CONCEPTO_ALQUILER);
  const conceptos = detalle?.lineas.filter((linea) => linea.nombre !== CONCEPTO_ALQUILER) ?? [];
  const incluidas = detalle?.lineas.filter(estaIncluida) ?? [];
  const liquidacion = detalle && !esLocatario ? calcularLiquidacion(detalle) : null;
  const total = liquidacion?.neto ?? incluidas.reduce((suma, linea) => suma + parseAmount(linea.monto), 0);

  function cerrarFormularios() {
    closeConceptForm();
    setRechazando(false);
    setComprobanteAbierto(false);
  }

  function elegirPersona(item, nuevoContrato) {
    datos.elegir(item, nuevoContrato);
    cerrarFormularios();
    setPeopleOpen(false);
  }

  function elegirPeriodo(anio, mes) {
    cerrarFormularios();
    datos.cambiarPeriodo(anio, mes);
  }

  function elegirPendiente(id) {
    cerrarFormularios();
    setPeopleOpen(false);
    datos.elegirRevision(id);
  }

  function openConceptForm(tipo) {
    setAdding(tipo);
  }

  function closeConceptForm() {
    setAdding("");
    setNewConcept({ label: "", amount: "" });
  }

  async function submitConcept(event) {
    event.preventDefault();
    const label = newConcept.label.trim();
    if (!label || parseAmount(newConcept.amount) <= 0) {
      mostrarAviso({ tipo: "advertencia", titulo: "Datos incompletos", mensaje: "Ingresá un concepto y un importe mayor a cero." });
      return;
    }
    if (await datos.agregarConcepto(label, newConcept.amount.trim(), adding === "temporary")) closeConceptForm();
  }

  function subirComprobante(event) {
    const [archivo] = event.target.files;
    event.target.value = "";
    if (!archivo) return;
    const error = validarComprobante(archivo);
    if (error) {
      mostrarAviso({ tipo: "advertencia", titulo: "Comprobante inválido", mensaje: error });
      return;
    }
    datos.subirComprobanteCobro(archivo);
  }

  const panel = personas ? (
    <PanelPersonas
      key={persona?.id}
      personas={personas}
      query={query}
      persona={persona}
      idContrato={contrato?.idContrato}
      onSelect={elegirPersona}
      guardando={guardando}
    />
  ) : (
    <p className="pagos-agente__people-empty">Cargando personas...</p>
  );

  return (
    <main id="pagos-agente">
      <header className="pagos-agente__hero">
        <h1>Pagos y cobros</h1>
        <p className="pagos-agente__hero-desktop">
          Estos pagos y cobros se pueden consultar desde la sección Pagos de propietarios y locatarios.
        </p>
        <p className="pagos-agente__hero-mobile">Gestioná los pagos y cobros de tus inquilinos o propietarios.</p>
      </header>

      <div className="pagos-agente__layout">
        {esMovil ? (
          <PanelDeslizable
            etiqueta="Personas"
            ancho="min(340px, 88vw)"
            superior="var(--pagos-alto-header, 40px)"
            posicion="32%"
            abierto={peopleOpen}
            onCambiar={setPeopleOpen}
          >
            {panel}
          </PanelDeslizable>
        ) : (
          <aside className="pagos-agente__people" aria-label="Personas">
            {panel}
          </aside>
        )}

        <section className="pagos-agente__workspace" aria-label="Gestión de pagos y cobros">
          <ColaRevision
            pendientes={pendientes}
            idSeleccionado={idRevision}
            onSelect={elegirPendiente}
            onRefresh={datos.actualizarPendientes}
            ocupado={guardando}
          />
          {idRevision && (
            <PanelRevisionPago
              key={idRevision}
              revision={revision}
              guardando={guardando}
              onVolver={() => datos.elegirRevision(null)}
              onAprobar={datos.aprobar}
              onRechazar={datos.rechazar}
            />
          )}
          {!idRevision && (!persona ? (
            <p className="pagos-agente__feedback" role="status">
              {!personas ? "Cargando personas…" : error || "No hay contratos de alquiler vigentes."}
            </p>
          ) : (
            <div className="pagos-agente__toolbar">
              <div className="pagos-agente__record">
                <div className="pagos-agente__period">
                  <label className="pagos-agente__select">
                    <span className="sr-only">Año</span>
                    <select
                      value={datos.anio}
                      onChange={(event) => elegirPeriodo(Number(event.target.value), datos.mes)}
                      disabled={guardando}
                    >
                      {ANIOS.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                    <Icono src={angleDownIcon} />
                  </label>
                  <label className="pagos-agente__select pagos-agente__select--month">
                    <span className="sr-only">Mes</span>
                    <select
                      value={datos.mes}
                      onChange={(event) => elegirPeriodo(datos.anio, Number(event.target.value))}
                      disabled={guardando}
                    >
                      {MESES.map((value, index) => (
                        <option key={value} value={index + 1}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <Icono src={angleDownIcon} />
                  </label>
                </div>
                <h2 className="pagos-agente__person-name">{persona.nombre}</h2>
                {alquiler && (
                  <label className="pagos-agente__rent">
                    <span>Alquiler</span>
                    <input
                      className="pagos-agente__rent-amount"
                      type="text"
                      inputMode="decimal"
                      value={alquiler.monto}
                      disabled={bloqueado}
                      onChange={(event) =>
                        datos.actualizarLinea(alquiler.idConcepto, { monto: soloNumeros(event.target.value) })
                      }
                      aria-label="Importe del alquiler"
                    />
                  </label>
                )}
              </div>
              {detalle && (
                <div className="pagos-agente__decisions">
                  {esLocatario && (
                    <BotonDecision
                      type="rejected"
                      neutral={detalle.estado === "Aprobado"}
                      active={detalle.estado === "Rechazado"}
                      disabled={!detalle.puedeRechazar || guardando}
                      onClick={() => setRechazando(true)}
                    >
                      Rechazar pago
                    </BotonDecision>
                  )}
                  <BotonDecision
                    type="approved"
                    active={["Aprobado", "Liquidado"].includes(detalle.estado)}
                    disabled={!detalle.puedeAprobar || guardando}
                    onClick={datos.aprobar}
                  >
                    {enRevision ? "Aprobar pago" : "Marcar como pagado"}
                  </BotonDecision>
                </div>
              )}
            </div>
          ))}
          {!idRevision && persona && !detalle && (
            <p className="pagos-agente__feedback" role="status">
              {cargando ? "Cargando detalle…" : error || "No se pudo cargar el detalle."}
            </p>
          )}
          {!idRevision && detalle && (
            <>
              {rechazando && detalle.puedeRechazar && (
                <FormularioRechazo
                  guardando={guardando}
                  onRechazar={datos.rechazar}
                  onCancelar={() => setRechazando(false)}
                />
              )}

              <div className="pagos-agente__record-grid">
                <article className="pagos-agente__propiedad-card">
                  <div className="pagos-agente__propiedad-main">
                    <div className="pagos-agente__propiedad-copy">
                      <h2>{contrato.propiedad}</h2>
                      <p>Estado: {ESTADOS_PAGO[detalle.estado] ?? detalle.estado}</p>
                      {detalle.comprobante?.motivoRechazo && detalle.estado === "Rechazado" && (
                        <p>Motivo del rechazo: {detalle.comprobante.motivoRechazo}</p>
                      )}
                      <p>
                        Vigencia: {formatDate(detalle.contrato.fechaInicio)} – {formatDate(detalle.contrato.fechaFin)}
                      </p>
                      <p>Monto acordado: {formatCurrency(detalle.contrato.montoAcordado, moneda)}</p>
                    </div>
                    <div className="pagos-agente__concepts" aria-label="Conceptos">
                      {conceptos.map((linea) => {
                        const id = `concepto-${linea.idConcepto}`;
                        const tono = linea.tono ?? (linea.checked ? "green" : "muted");
                        return (
                          <div
                            className={`pagos-agente__concept pagos-agente__concept--${tono}${linea.checked ? " is-selected" : ""}`}
                            key={linea.idConcepto}
                          >
                            <input
                              id={id}
                              type="checkbox"
                              checked={linea.checked}
                              disabled={bloqueado}
                              onChange={(event) =>
                                datos.actualizarLinea(linea.idConcepto, { checked: event.target.checked })
                              }
                            />
                            <label htmlFor={id}>{linea.nombre}</label>
                            <input
                              className="pagos-agente__amount"
                              type="text"
                              inputMode="decimal"
                              value={linea.monto}
                              disabled={bloqueado}
                              onChange={(event) =>
                                datos.actualizarLinea(linea.idConcepto, { monto: soloNumeros(event.target.value) })
                              }
                              aria-label={`Importe de ${linea.nombre}`}
                            />
                            <span
                              className="pagos-agente__info"
                              title={linea.checked ? "Incluido en el detalle" : "Marcá el concepto para incluirlo en el detalle"}
                              aria-label={linea.checked ? "Incluido en el detalle" : "No incluido en el detalle"}
                            >
                              <Icono src={circleInfoIcon} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pagos-agente__concept-actions">
                      <button type="button" disabled={bloqueado} onClick={() => openConceptForm("permanent")}>
                        <Icono src={plusIconWhite} />
                        Nuevo concepto
                      </button>
                      <button type="button" disabled={bloqueado} onClick={() => openConceptForm("temporary")}>
                        <Icono src={plusIconWhite} />
                        Concepto temporal
                      </button>
                    </div>
                    {adding && !bloqueado && (
                      <form className="pagos-agente__new-concept" onSubmit={submitConcept}>
                        <label>
                          <span>Concepto {adding === "temporary" ? "temporal" : "nuevo"}</span>
                          <input
                            autoFocus
                            value={newConcept.label}
                            onChange={(event) => setNewConcept((actual) => ({ ...actual, label: event.target.value }))}
                            placeholder="Nombre"
                          />
                        </label>
                        <label>
                          <span>Importe</span>
                          <input
                            inputMode="decimal"
                            value={newConcept.amount}
                            onChange={(event) =>
                              setNewConcept((actual) => ({ ...actual, amount: soloNumeros(event.target.value) }))
                            }
                            placeholder="0,00"
                          />
                        </label>
                        <div>
                          <button type="button" onClick={closeConceptForm}>
                            Cancelar
                          </button>
                          <button type="submit">Agregar</button>
                        </div>
                      </form>
                    )}
                    {(!bloqueado || detalle.nota) && (
                      <label className="pagos-agente__note">
                        <span>Detalle de administración</span>
                        <textarea
                          value={detalle.nota}
                          maxLength={255}
                          rows={2}
                          disabled={bloqueado}
                          onChange={(event) => datos.cambiarNota(event.target.value)}
                        />
                      </label>
                    )}
                  </div>
                  <aside
                    className={`pagos-agente__receipt${detalle.comprobante ? " has-receipt" : ""}`}
                    aria-label={esLocatario ? "Comprobante del inquilino" : "Comprobante de la liquidación"}
                  >
                    {detalle.comprobante ? (
                      <button
                        className="pagos-agente__receipt-preview"
                        type="button"
                        onClick={() => setComprobanteAbierto(true)}
                      >
                        <Icono src={fileLinesIcon} />
                        Abrir comprobante
                      </button>
                    ) : (
                      <div className="pagos-agente__receipt-preview">
                        <Icono src={imageIcon} />
                        Sin comprobante
                      </div>
                    )}
                    <div className="pagos-agente__receipt-caption">
                      <Icono src={fileLinesIcon} />
                      <span>
                        {esLocatario ? "Comprobante del inquilino" : "Comprobante de la liquidación"}
                        {detalle.comprobante && <small>{formatDateTime(detalle.comprobante.fecha)}</small>}
                      </span>
                    </div>
                    {!esLocatario && detalle.registro && detalle.editable && (
                      <label className="pagos-agente__receipt-upload">
                        <span>{detalle.comprobante ? "Cambiar comprobante" : "Subir comprobante"}</span>
                        <input
                          className="sr-only"
                          type="file"
                          accept={TIPOS_COMPROBANTE}
                          onChange={subirComprobante}
                          disabled={guardando}
                        />
                      </label>
                    )}
                  </aside>
                </article>

                <div className="pagos-agente__summary-column">
                  <aside className="pagos-agente__total" aria-label="Detalle">
                    <h2>{esLocatario ? "Detalle del cobro" : "Detalle de la liquidación"}</h2>
                    <div className="pagos-agente__total-lines">
                      {incluidas.map((linea) => (
                        <div className="pagos-agente__total-line" key={linea.idConcepto}>
                          <span>{linea.nombre}</span>
                          <b>{formatCurrency(parseAmount(linea.monto), moneda)}</b>
                        </div>
                      ))}
                      {liquidacion && (
                        <>
                          <label className="pagos-agente__total-line pagos-agente__commission">
                            <span>Comisión (%)</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={detalle.porcentaje}
                              disabled={bloqueado}
                              placeholder={detalle.registro ? "Fija" : "0"}
                              onChange={(event) => datos.cambiarComision(soloNumeros(event.target.value).replace("-", ""))}
                              aria-label="Porcentaje de comisión"
                            />
                          </label>
                          <div className="pagos-agente__total-line">
                            <span>Comisión inmobiliaria</span>
                            <b>-{formatCurrency(liquidacion.comision, moneda)}</b>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="pagos-agente__total-sum">
                      <span>{liquidacion ? "Total neto:" : "Total:"}</span>
                      <b>{formatCurrency(total, moneda)}</b>
                    </div>
                  </aside>
                  <button
                    className="pagos-agente__send"
                    type="button"
                    onClick={datos.enviar}
                    disabled={bloqueado || !incluidas.length}
                  >
                    <Icono src={paperPlaneIcon} />
                    {detalle.registro ? "Guardar cambios" : esLocatario ? "Enviar pago" : "Enviar liquidación"}
                  </button>
                </div>
              </div>
              {comprobanteAbierto && detalle.comprobante && (
                <DialogoComprobante
                  cargar={esLocatario ? obtenerComprobantePago : obtenerComprobanteCobro}
                  id={detalle.registro.id}
                  nombre={detalle.comprobante.nombre}
                  onCerrar={() => setComprobanteAbierto(false)}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
