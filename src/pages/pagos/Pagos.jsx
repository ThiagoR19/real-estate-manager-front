import { useEffect, useRef, useState } from "react";
import {
  buildingColumnsIcon,
  calendarIcon,
  checkIcon,
  commentsIcon,
  downloadIcon,
  fileLinesIcon,
  imageIcon,
  optionsIcon,
  paperPlaneIcon,
  plusIconWhite,
  xIcon,
} from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import SelectDesplegable from "../../components/select/SelectDesplegable";
import useHistorialPeriodos, {
  etiquetarContratos,
  formatearFecha,
  formatearFechaHora,
  formatearMonto,
  nombreMes,
  nombrePeriodo,
} from "../../hooks/useHistorialPeriodos";
import {
  contratosDisponiblesParaPago,
  descargarComprobantePago,
  marcarPagoPagado,
  obtenerComprobantePago,
  pago as obtenerPago,
  pagos as listarPagos,
  solicitarRevisionPago,
  subirComprobantePago,
  TIPOS_COMPROBANTE,
  validarComprobante,
} from "../../services/pagos";
import { DialogoComprobante, DialogoRevision, VistaComprobante } from "./Comprobante";
import RegistroPago from "./RegistroPago";
import "./PagosMovil.css";
import "./PagosReferencia.css";

const ESTADOS = {
  "En revision": { texto: "En proceso", tono: "info" },
  Aprobado: { texto: "Aprobado", tono: "success" },
  Rechazado: { texto: "Rechazado", tono: "danger" },
  Anulado: { texto: "Anulado", tono: "neutral" },
};
const FECHA_LOCAL = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

function estadoDe(pago) {
  if (pago.estado !== "Pendiente") {
    return ESTADOS[pago.estado] ?? { texto: pago.estado, tono: "neutral" };
  }
  if (pago.tieneComprobante) return { texto: "Sin enviar", tono: "neutral" };
  if (pago.fechaVencimiento && formatearFecha(pago.fechaVencimiento).split("/").reverse().join("-") < FECHA_LOCAL.format(new Date())) {
    return { texto: "Impago", tono: "danger" };
  }
  return { texto: "Sin comprobante", tono: "neutral" };
}

function Icono({ src }) {
  return <img className="vista-pago__icon" src={src} alt="" />;
}

function EstadoPago({ estado, destacado = false }) {
  return (
    <span className={`vista-pago__status vista-pago__status--${estado.tono}`}>
      {destacado && estado.tono === "success" && <Icono src={checkIcon} />}
      {estado.texto}
    </span>
  );
}

function ResumenPagos({ abierto, periodos }) {
  const total = periodos.length;
  const tarjetas = [
    { titulo: "Comprobantes enviados", icono: fileLinesIcon, tono: "blue", contar: (item) => item.tieneComprobante && item.estado !== "Pendiente" },
    { titulo: "Pagos aprobados", icono: checkIcon, tono: "green", contar: (item) => item.estado === "Aprobado" },
    { titulo: "Pagos rechazados", icono: xIcon, tono: "red", contar: (item) => item.estado === "Rechazado" },
  ];
  return (
    <section
      className={`vista-pago__summary pagos__summary${abierto ? " is-open" : ""}`}
      id="vista-pago-summary"
      aria-label="Resumen de pagos"
    >
      {tarjetas.map(({ titulo, icono, tono, contar }) => (
        <article key={titulo}>
          <span className={`vista-pago__metric vista-pago__metric--${tono}`}><Icono src={icono} /></span>
          <strong>{titulo}</strong>
          <b>{periodos.filter(contar).length}/{total}</b>
        </article>
      ))}
    </section>
  );
}

function DatoPago({ icono, etiqueta, valor, className }) {
  return (
    <div className={className}>
      <span className="vista-pago__round" aria-hidden="true">{icono ? <Icono src={icono} /> : "$"}</span>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

function DetallePago({ pago, cargando, error, recargar }) {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [dialogo, setDialogo] = useState(null);
  const estado = estadoDe(pago);
  const comprobante = pago.comprobantes?.[0];
  const puedeEnviar = pago.estado === "Pendiente" || pago.estado === "Rechazado";
  const tieneComprobante = pago.tieneComprobante || Boolean(comprobante);
  const puedePrevisualizar = archivo || tieneComprobante;
  const nombreArchivo = archivo?.name || comprobante?.nombreArchivo;
  const argumentosComprobante = {
    cargar: obtenerComprobantePago,
    id: pago.id,
    nombre: nombreArchivo,
    archivo,
    version: comprobante?.id,
  };
  const motivo = pago.estado === "Rechazado" && comprobante?.motivoRechazo;
  const etiquetaMonto = {
    Aprobado: "Monto abonado",
    "En revision": "Monto informado",
  }[pago.estado] ?? "Monto a abonar";
  const nota = [
    pago.detalle,
    motivo ? `Motivo del rechazo: ${motivo}` : "",
    pago.estado === "En revision" ? "La inmobiliaria está revisando el comprobante." : "",
  ].filter(Boolean).join(" ");

  function seleccionarArchivo(evento) {
    const elegido = evento.target.files?.[0];
    evento.target.value = "";
    if (!elegido) return;
    const validacion = validarComprobante(elegido);
    setErrorEnvio(validacion);
    if (validacion) return;
    setArchivo(elegido);
  }

  async function enviar() {
    if (enviando || cargando || !puedeEnviar) return;
    if (!archivo && comprobante?.estado !== "PENDIENTE") {
      setErrorEnvio("Elegí un comprobante antes de enviarlo.");
      return;
    }
    setEnviando(true);
    setErrorEnvio("");
    try {
      if (archivo) await subirComprobantePago(pago.id, archivo, { enviar: true });
      else await marcarPagoPagado(pago.id);
      setArchivo(null);
      recargar();
      mostrarAviso({ tipo: "exito", titulo: "Comprobante enviado", mensaje: "La inmobiliaria recibió el pago para revisión." });
    } catch (causa) {
      setErrorEnvio(causa.message);
    } finally {
      setEnviando(false);
    }
  }

  async function descargar() {
    try {
      await descargarComprobantePago(pago.id, comprobante?.nombreArchivo);
    } catch (causa) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo descargar el comprobante", mensaje: causa.message });
    }
  }

  const titulo = nombrePeriodo(pago.periodo);
  return (
    <div className="vista-pago__content pagos__content">
      <article className="vista-pago__receipt-column pagos__receipt-column">
        {puedePrevisualizar && (
          <button className="pago-movil__open-receipt" type="button" onClick={() => setDialogo("comprobante")}>
            <Icono src={imageIcon} />
            Abrir comprobante
          </button>
        )}
        <div className="vista-pago__receipt-frame pagos__receipt-frame">
          {puedePrevisualizar ? (
            <VistaComprobante {...argumentosComprobante} onAbrir={() => setDialogo("comprobante")} />
          ) : (
            <div className="vista-pago__empty-receipt"><Icono src={fileLinesIcon} />Sin comprobante</div>
          )}
        </div>
        <div className={`vista-pago__uploaded pagos__uploaded${puedePrevisualizar ? " is-approved" : ""}`}>
          <Icono src={fileLinesIcon} />
          <span>
            <strong>{archivo ? "Comprobante listo para enviar" : tieneComprobante ? "Comprobante cargado" : "Sin comprobante"}</strong>
            {archivo && <small>{archivo.name}</small>}
            {!archivo && comprobante?.fechaCarga && <small>{formatearFechaHora(comprobante.fechaCarga)}</small>}
            {!puedePrevisualizar && puedeEnviar && <small>PDF, JPG, PNG o WebP de hasta 5 MB</small>}
          </span>
        </div>
      </article>

      <section className="vista-pago__detail pagos__detail" aria-labelledby="vista-pago-title">
        <header className="pagos__detail-heading">
          <h1 id="vista-pago-title">{titulo}</h1>
          <EstadoPago estado={estado} destacado />
        </header>
        <div className="vista-pago__financials">
          <dl className="vista-pago__facts pagos__facts">
            <DatoPago icono={calendarIcon} etiqueta="Fecha de pago" valor={formatearFecha(pago.fechaPago)} />
            <DatoPago
              icono={calendarIcon}
              etiqueta={pago.fechaLiquidacion ? "Fecha de liquidación" : pago.estado === "Aprobado" ? "Fecha de aprobación" : "Vencimiento"}
              valor={formatearFecha(pago.fechaLiquidacion ?? (pago.estado === "Aprobado" ? comprobante?.fechaRevision : pago.fechaVencimiento))}
            />
            <DatoPago etiqueta={etiquetaMonto} valor={formatearMonto(pago.monto)} />
            <DatoPago
              className="pagos__facts-total"
              etiqueta={pago.moneda ? `Monto total (${pago.moneda})` : "Monto total"}
              valor={formatearMonto(pago.monto)}
            />
          </dl>
          <section className="vista-pago__breakdown pagos__breakdown" aria-label="Detalle del pago">
            <h2>Detalle del pago</h2>
            {cargando ? (
              <p role="status">Cargando detalle…</p>
            ) : error ? (
              <button type="button" onClick={recargar}>Reintentar detalle</button>
            ) : pago.conceptos?.length ? (
              <dl>
                {pago.conceptos.map((linea) => (
                  <div key={linea.idConcepto}>
                    <dt>{linea.nombre}</dt>
                    <dd>{formatearMonto(linea.monto)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>Sin desglose por concepto.</p>
            )}
          </section>
        </div>
        {nota && (
          <aside className="vista-pago__admin-note pagos__admin-note">
            <span><Icono src={commentsIcon} /></span>
            <div><strong>Detalle de administración</strong><p>{nota}</p></div>
          </aside>
        )}
        <div className="vista-pago__actions pagos__actions">
          {puedeEnviar && (
            <label className="vista-pago__action vista-pago__action--secondary vista-pago__file">
              <Icono src={downloadIcon} />
              <span>{archivo ? "Cambiar comprobante" : "Subir comprobante"}</span>
              <input type="file" accept={TIPOS_COMPROBANTE} onChange={seleccionarArchivo} disabled={enviando || cargando} />
            </label>
          )}
          {tieneComprobante && !archivo && (
            <Boton className="vista-pago__action vista-pago__action--secondary" onClick={descargar}>
              <Icono src={downloadIcon} />Descargar comprobante
            </Boton>
          )}
          {puedeEnviar ? (
            <Boton
              className="vista-pago__action vista-pago__action--primary"
              icon={paperPlaneIcon}
              text={enviando ? "Enviando…" : "Enviar para revisión"}
              onClick={enviar}
              disabled={enviando || cargando || (!archivo && comprobante?.estado !== "PENDIENTE")}
            />
          ) : pago.estado === "Aprobado" && (
            <Boton className="vista-pago__action vista-pago__action--primary" icon={paperPlaneIcon} text="Solicitar revisión" onClick={() => setDialogo("revision")} />
          )}
        </div>
        {errorEnvio && <p className="vista-pago__error" role="alert">{errorEnvio}</p>}
        {pago.estado === "Aprobado" && tieneComprobante && (
          <p className="vista-pago__note pagos__disclaimer">El comprobante queda disponible para consultas y descarga.</p>
        )}
      </section>
      {dialogo === "comprobante" && <DialogoComprobante {...argumentosComprobante} onCerrar={() => setDialogo(null)} />}
      {dialogo === "revision" && <DialogoRevision periodo={titulo} solicitar={solicitarRevisionPago} id={pago.id} onCerrar={() => setDialogo(null)} />}
    </div>
  );
}

export default function Pagos() {
  const historial = useHistorialPeriodos(listarPagos, obtenerPago);
  const { items, contratos, contrato, delContrato, anios, detalle: pago } = historial;
  const [aniosAbiertos, setAniosAbiertos] = useState({});
  const [panel, setPanel] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [consulta, setConsulta] = useState(0);
  const abrirCronologia = useRef(null);
  const cerrarCronologia = useRef(null);
  const cronologiaAbierta = panel === "cronologia";
  const resumenAbierto = panel === "resumen";

  useEffect(() => {
    let activo = true;
    contratosDisponiblesParaPago()
      .then((contratos) => {
        if (activo) setDisponibilidad({ contratos: etiquetarContratos(contratos), error: "" });
      })
      .catch((causa) => {
        if (activo) setDisponibilidad({ contratos: [], error: causa.message });
      });
    return () => { activo = false; };
  }, [consulta]);

  useEffect(() => {
    if (!panel) return;
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") setPanel(null);
    }
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [panel]);

  useEffect(() => {
    if (!cronologiaAbierta) return;
    const boton = abrirCronologia.current;
    cerrarCronologia.current?.focus();
    return () => boton?.focus();
  }, [cronologiaAbierta]);

  function actualizarDisponibilidad() {
    setDisponibilidad(null);
    setConsulta((actual) => actual + 1);
  }

  function registrarExito(nuevoPago) {
    historial.incorporar(nuevoPago);
    actualizarDisponibilidad();
    setFormularioAbierto(false);
    mostrarAviso({ tipo: "exito", titulo: "Pago registrado", mensaje: "La inmobiliaria recibió el comprobante para revisión." });
  }

  function abrirPeriodoRegistrado(idContrato, periodo) {
    historial.elegirContrato(idContrato, periodo);
    historial.recargar();
    actualizarDisponibilidad();
    setFormularioAbierto(false);
    mostrarAviso({ tipo: "info", titulo: "El período ya está registrado", mensaje: "Podés continuar desde el detalle del pago en el historial." });
  }

  const disponibles = disponibilidad?.contratos ?? [];

  if (items === null) {
    return (
      <main id="vista-pago" className="vista-pago--sin-periodos">
        <section className="vista-pago__empty-page" aria-label="Zona de pago">
          <p role="status">Cargando zona de pago…</p>
        </section>
      </main>
    );
  }

  if (formularioAbierto || !pago) {
    return (
      <main id="vista-pago" className="vista-pago--sin-periodos">
        <section className="vista-pago__empty-page registro-pago" aria-labelledby="vista-pago-title">
          <header className="registro-pago__cabecera">
            <h1 id="vista-pago-title">Registrar pago</h1>
            {pago && (
              <button type="button" className="registro-pago__volver" onClick={() => setFormularioAbierto(false)}>
                Volver al historial
              </button>
            )}
          </header>
          {historial.error && (
            <p role="alert">
              No pudimos cargar el historial de pagos.{" "}
              <button type="button" className="registro-pago__volver" onClick={historial.recargar}>Reintentar historial</button>
            </p>
          )}
          {!disponibilidad ? (
            <p role="status">Cargando períodos disponibles…</p>
          ) : disponibilidad.error ? (
            <>
              <p role="alert">{disponibilidad.error}</p>
              <Boton text="Reintentar" onClick={actualizarDisponibilidad} />
            </>
          ) : disponibles.length ? (
            <RegistroPago
              contratos={disponibles}
              idContratoInicial={contrato?.idContrato}
              onRegistrado={registrarExito}
              onPeriodoRegistrado={abrirPeriodoRegistrado}
            />
          ) : (
            <p role="status">No hay períodos disponibles para registrar un pago.</p>
          )}
        </section>
      </main>
    );
  }

  const opciones = contratos.map((item) => item.etiqueta);
  const selector = {
    value: contrato?.etiqueta,
    placeholder: contrato?.etiqueta,
    options: opciones,
    onChange: (etiqueta) => historial.elegirContrato(contratos.find((item) => item.etiqueta === etiqueta).idContrato),
  };

  return (
    <main id="vista-pago">
      <div className="pago-movil__toolbar">
        <SelectDesplegable
          {...selector}
          label="Propiedad"
          icon={buildingColumnsIcon}
          className="vista-pago__mobile-propiedad-select"
          triggerClassName="vista-pago__mobile-propiedad-trigger"
        />
        <button ref={abrirCronologia} type="button" aria-label="Abrir cronología" aria-controls="vista-pago-chronology" aria-expanded={cronologiaAbierta} onClick={() => setPanel("cronologia")}>
          <Icono src={optionsIcon} />
        </button>
      </div>
      {panel && <button className="pago-movil__fondo" type="button" aria-label="Cerrar panel" onClick={() => setPanel(null)} />}
      {cronologiaAbierta && (
        <button ref={cerrarCronologia} className="pago-movil__close" type="button" aria-label="Cerrar cronología" onClick={() => setPanel(null)}>×</button>
      )}
      <button
        className={`pago-movil__summary-toggle${resumenAbierto ? " is-open" : ""}`}
        type="button"
        aria-label={resumenAbierto ? "Cerrar resumen" : "Abrir resumen de pagos"}
        aria-controls="vista-pago-summary"
        aria-expanded={resumenAbierto}
        onClick={() => setPanel(resumenAbierto ? null : "resumen")}
      >
        {resumenAbierto ? "‹" : "›"}
      </button>
      <aside className={`vista-pago__sidebar pagos__sidebar${cronologiaAbierta ? " is-open" : ""}`} id="vista-pago-chronology" aria-label="Propiedades y períodos">
        <h2>
          <span className="pago-movil__desktop">Propiedades</span>
          <span className="pago-movil__chronology">Cronología</span>
        </h2>
        <div className="vista-pago__propiedad-row">
          <button type="button" aria-label="Propiedad anterior" disabled={contratos.length < 2} onClick={() => historial.moverContrato(-1)}>‹</button>
          <SelectDesplegable
            {...selector}
            label="Seleccionar propiedad"
            className="vista-pago__propiedad-select"
            triggerClassName="vista-pago__propiedad-trigger"
            valueClassName="vista-pago__propiedad-value"
            showChevron={false}
          />
          <button type="button" aria-label="Propiedad siguiente" disabled={contratos.length < 2} onClick={() => historial.moverContrato(1)}>›</button>
        </div>
        <div className="vista-pago__years pagos__years">
          {anios.map(({ anio, periodos }) => {
            const clave = `${contrato.idContrato}|${anio}`;
            const abierto = aniosAbiertos[clave] ?? pago.periodo.startsWith(anio);
            return (
              <section className="vista-pago__year pagos__year" key={anio}>
                <button
                  className="vista-pago__year-button"
                  type="button"
                  onClick={() => setAniosAbiertos((actual) => ({ ...actual, [clave]: !abierto }))}
                  aria-expanded={abierto}
                >
                  <strong>{anio}</strong><span className={`vista-pago__chevron${abierto ? " is-open" : ""}`} aria-hidden="true" />
                </button>
                {abierto && (
                  <div className="vista-pago__months">
                    {periodos.map((item) => (
                      <button
                        key={item.id}
                        className={`vista-pago__month pagos__month${item.id === pago.id ? " is-selected" : ""}`}
                        type="button"
                        aria-pressed={item.id === pago.id}
                        onClick={() => { historial.elegir(item.id); setPanel(null); }}
                      >
                        <strong>{nombreMes(item.periodo)}</strong><EstadoPago estado={estadoDe(item)} />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </aside>
      <section className="vista-pago__workspace pagos__workspace">
        {(disponibles.length > 0 || disponibilidad?.error) && (
          <div className="vista-pago__registro">
            <Boton
              className="vista-pago__action vista-pago__action--primary"
              icon={plusIconWhite}
              text="Registrar pago"
              onClick={() => { setPanel(null); setFormularioAbierto(true); }}
            />
          </div>
        )}
        <ResumenPagos abierto={resumenAbierto} periodos={delContrato} />
        <DetallePago key={pago.id} pago={pago} cargando={historial.cargandoDetalle} error={historial.errorDetalle} recargar={historial.recargar} />
      </section>
    </main>
  );
}
