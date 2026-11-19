import { useEffect, useState } from "react";
import { api } from "../services/api";
import { mostrarAviso } from "../components/avisos/almacenAvisos";

export const CONCEPTO_ALQUILER = "Alquiler mensual";
const PAGO_EDITABLE = ["Pendiente", "Rechazado"];

export function parseAmount(value) {
  const normalized = String(value).trim().replace(/[^\d,.-]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");

  if (comma !== -1 && dot !== -1) {
    const decimal = comma > dot ? "," : ".";
    const miles = decimal === "," ? /\./g : /,/g;
    return Number(normalized.replace(miles, "").replace(decimal, ".")) || 0;
  }
  if (comma !== -1) return Number(normalized.replace(/\./g, "").replace(",", ".")) || 0;
  if (dot !== -1 && normalized.length - dot - 1 === 3) return Number(normalized.replace(/\./g, "")) || 0;
  return Number(normalized) || 0;
}

export function estaIncluida(linea) {
  return linea.nombre === CONCEPTO_ALQUILER ? parseAmount(linea.monto) > 0 : linea.checked;
}

const redondear = (valor) => Math.round(valor * 100) / 100;

export function calcularLiquidacion(detalle) {
  const montos = detalle.lineas.filter(estaIncluida).map((linea) => parseAmount(linea.monto));
  const bruto = redondear(montos.filter((monto) => monto > 0).reduce((suma, monto) => suma + monto, 0));
  const descuentos = redondear(Math.abs(montos.filter((monto) => monto < 0).reduce((suma, monto) => suma + monto, 0)));
  const comision = detalle.porcentaje !== ""
    ? redondear((bruto * parseAmount(detalle.porcentaje)) / 100)
    : detalle.registro?.comision ?? 0;
  return { bruto, descuentos, comision, neto: redondear(bruto - comision - descuentos) };
}

function comisionDelCuerpo(detalle) {
  if (detalle.porcentaje !== "") return { porcentajeComision: parseAmount(detalle.porcentaje) };
  if (detalle.registro) return { comision: detalle.registro.comision };
  return {};
}

function aPersonas(lista, tipo) {
  return lista.map((persona) => ({
    id: `${tipo}-${persona.idPersona}`,
    tipo,
    nombre: `${persona.nombre ?? ""} ${persona.apellido ?? ""}`.trim(),
    idPropietario: persona.idPropietario,
    contratos: persona.contratos,
  }));
}

function armarLineas(conceptos, guardadas, montoInicial, preseleccionado) {
  const montos = new Map((guardadas ?? []).map((linea) => [linea.idConcepto, linea.monto]));
  return conceptos.map((concepto) => ({
    idConcepto: concepto.id,
    nombre: concepto.nombre,
    monto: String(montos.get(concepto.id) ?? montoInicial(concepto)),
    checked: guardadas ? montos.has(concepto.id) : preseleccionado(concepto),
  }));
}

async function detalleDePago(contrato, periodo) {
  const { contrato: datosContrato, pago, conceptos } = await api.prepararPago(contrato.idContrato, periodo);
  const estado = pago?.estado ?? "Sin enviar";
  const comprobante = pago?.comprobantes?.[0];

  return {
    contrato: datosContrato,
    registro: pago,
    estado,
    nota: pago?.detalle ?? "",
    editable: !pago || PAGO_EDITABLE.includes(estado),
    puedeAprobar: Boolean(pago) && !["Aprobado", "Anulado"].includes(estado),
    puedeRechazar: estado === "En revision",
    comprobante: comprobante ? {
      nombre: comprobante.nombreArchivo,
      fecha: comprobante.fechaCarga,
      motivoRechazo: comprobante.motivoRechazo,
    } : null,
    lineas: armarLineas(
      conceptos,
      pago?.conceptos,
      (concepto) =>
        concepto.montoAnterior || (concepto.nombre === CONCEPTO_ALQUILER ? datosContrato.montoAcordado : 0),
      (concepto) => concepto.activoAnterior,
    ),
  };
}

async function detalleDeCobro(persona, contrato, periodo) {
  const datos = await api.prepararCobro(contrato.idContrato, persona.idPropietario, periodo);
  const { pago, cobro, conceptos } = datos;
  const pagoAprobado = pago?.estado === "Aprobado";

  return {
    contrato: datos.contrato,
    pago,
    registro: cobro,
    estado: cobro?.estado ?? (pagoAprobado ? "Sin liquidar" : "Esperando el pago del inquilino"),
    nota: cobro?.detalle ?? "",
    editable: cobro ? cobro.estado === "Pendiente" : pagoAprobado,
    puedeAprobar: cobro?.estado === "Pendiente",
    puedeRechazar: false,
    porcentaje: cobro?.porcentajeComision != null ? String(cobro.porcentajeComision) : "",
    comprobante: cobro?.nombreArchivo ? { nombre: cobro.nombreArchivo, fecha: cobro.fechaComprobante } : null,
    lineas: armarLineas(
      conceptos,
      cobro?.conceptos,
      (concepto) => concepto.montoPago || concepto.montoAnterior || 0,
      (concepto) => concepto.montoPago !== 0 || concepto.activoAnterior,
    ),
  };
}

export default function usePagosYCobros() {
  const hoy = new Date();
  const [personas, setPersonas] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const [idRevision, setIdRevision] = useState(null);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [recargas, setRecargas] = useState(0);
  const [intentosPendientes, setIntentosPendientes] = useState(0);
  const [estado, setEstado] = useState(null);
  const [estadoRevision, setEstadoRevision] = useState(null);
  const [pendientes, setPendientes] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const persona = personas?.find((item) => item.id === seleccion?.idPersona) ?? null;
  const contrato = persona?.contratos.find((item) => item.idContrato === seleccion?.idContrato) ?? null;
  const periodo = `${anio}-${String(mes).padStart(2, "0")}`;
  const clave = contrato ? `${persona.id}|${contrato.idContrato}|${periodo}|${recargas}` : null;
  const cargando = Boolean(clave) && estado?.clave !== clave;
  const detalle = estado?.clave === clave ? estado.detalle : null;
  const revision = estadoRevision?.id === idRevision && estadoRevision.recargas === recargas
    ? estadoRevision
    : null;

  useEffect(() => {
    let activo = true;
    Promise.all([api.inquilinosConAlquiler(), api.propietariosConAlquiler()])
      .then(([inquilinos, propietarios]) => {
        if (!activo) return;
        const lista = [...aPersonas(inquilinos, "Locatario"), ...aPersonas(propietarios, "Propietario")];
        setPersonas(lista);
        const primera = lista.find((item) => item.contratos.length);
        if (primera) setSeleccion({ idPersona: primera.id, idContrato: primera.contratos[0].idContrato });
      })
      .catch((error) => {
        if (!activo) return;
        setPersonas([]);
        setError(error.message);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    api.pagos({ estado: "En revision" })
      .then((items) => activo && setPendientes({ items, error: "" }))
      .catch((error) => activo && setPendientes({ items: [], error: error.message }));

    return () => {
      activo = false;
    };
  }, [intentosPendientes, recargas]);

  useEffect(() => {
    if (!idRevision) return undefined;
    let activo = true;
    api.pago(idRevision)
      .then((pago) => activo && setEstadoRevision({ id: idRevision, recargas, pago }))
      .catch((error) => activo && setEstadoRevision({ id: idRevision, recargas, error: error.message }));

    return () => {
      activo = false;
    };
  }, [idRevision, recargas]);

  useEffect(() => {
    if (!clave) return undefined;
    let activo = true;
    const pedido = persona.tipo === "Locatario"
      ? detalleDePago(contrato, periodo)
      : detalleDeCobro(persona, contrato, periodo);

    pedido
      .then((nuevo) => activo && setEstado({ clave, detalle: nuevo }))
      .catch((error) => {
        if (!activo) return;
        setEstado({ clave, detalle: null, error: error.message });
      });
    return () => {
      activo = false;
    };
  }, [clave, persona, contrato, periodo]);

  function elegir(nuevaPersona, nuevoContrato) {
    setIdRevision(null);
    setSeleccion({ idPersona: nuevaPersona.id, idContrato: nuevoContrato.idContrato });
  }

  function elegirRevision(id) {
    if (id === idRevision) return;
    setEstadoRevision(null);
    setIdRevision(id);
  }

  function cambiarPeriodo(nuevoAnio, nuevoMes) {
    setAnio(nuevoAnio);
    setMes(nuevoMes);
  }

  function cambiarDetalle(cambiar) {
    setEstado((actual) => {
      if (actual?.clave !== clave || !actual?.detalle) return actual;
      return { ...actual, detalle: { ...actual.detalle, ...cambiar(actual.detalle) } };
    });
  }

  function actualizarLinea(idConcepto, cambios) {
    cambiarDetalle(({ lineas }) => ({
      lineas: lineas.map((linea) => (linea.idConcepto === idConcepto ? { ...linea, ...cambios } : linea)),
    }));
  }

  async function ejecutar(accion, titulo, mensaje) {
    setGuardando(true);
    try {
      await accion();
      mostrarAviso({ tipo: "exito", titulo, mensaje });
      setRecargas((cantidad) => cantidad + 1);
      return true;
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo completar la acción", mensaje: error.message });
      if (error.cause?.response?.status === 409) setRecargas((cantidad) => cantidad + 1);
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function cambiarComision(porcentaje) {
    cambiarDetalle(() => ({ porcentaje }));
  }

  function cambiarNota(nota) {
    cambiarDetalle(() => ({ nota }));
  }

  function enviar() {
    const conceptos = detalle.lineas
      .filter(estaIncluida)
      .map((linea) => ({ idConcepto: linea.idConcepto, monto: parseAmount(linea.monto) }));
    const registro = detalle.registro;
    const nota = detalle.nota.trim() || null;

    if (persona.tipo === "Locatario") {
      return ejecutar(
        () =>
          registro
            ? api.modificarPago(registro.id, {
                fechaVencimiento: registro.fechaVencimiento.slice(0, 10),
                detalle: nota,
                conceptos,
              })
            : api.crearPago({ idContrato: contrato.idContrato, periodo, conceptos, detalle: nota }),
        registro ? "Pago actualizado" : "Pago enviado",
        registro ? "Se guardaron los cambios del pago." : `El pago fue enviado a ${persona.nombre}.`,
      );
    }

    const porcentaje = parseAmount(detalle.porcentaje);
    if (detalle.porcentaje !== "" && (porcentaje < 0 || porcentaje > 100)) {
      mostrarAviso({ tipo: "advertencia", titulo: "Comisión inválida", mensaje: "La comisión tiene que estar entre 0 y 100 %." });
      return Promise.resolve(false);
    }

    const comision = comisionDelCuerpo(detalle);
    return ejecutar(
      () =>
        registro
          ? api.modificarCobro(registro.id, { conceptos, detalle: nota, ...comision })
          : api.crearCobro({
              idPago: detalle.pago.id,
              idPropietario: persona.idPropietario,
              conceptos,
              detalle: nota,
              ...comision,
            }),
      registro ? "Liquidación actualizada" : "Liquidación enviada",
      registro ? "Se guardaron los cambios de la liquidación." : `La liquidación fue enviada a ${persona.nombre}.`,
    );
  }

  function aprobar() {
    if (idRevision || persona.tipo === "Locatario") return decidirPago();
    return ejecutar(() => api.marcarCobroPagado(detalle.registro.id), "Liquidación pagada", `${persona.nombre}: la liquidación se marcó como pagada.`);
  }

  function decidirPago(motivo) {
    const pago = idRevision ? revision.pago : detalle.registro;
    const nombre = idRevision ? `${pago.nombre} ${pago.apellido}` : persona.nombre;
    const comprobante = pago.comprobantes?.[0];
    const idComprobante = pago.estado === "En revision" && comprobante?.estado === "PENDIENTE"
      ? comprobante.id
      : undefined;
    return motivo
      ? ejecutar(() => api.rechazarPago(pago.id, motivo, idComprobante), "Pago rechazado", `Se rechazó el pago de ${nombre}.`)
      : ejecutar(() => api.aprobarPago(pago.id, undefined, idComprobante), "Pago aprobado", `Se aprobó el pago de ${nombre}.`);
  }

  async function agregarConcepto(nombre, monto, temporal) {
    const tono = temporal ? "blue" : "green";
    const existente = detalle.lineas.find(
      (linea) => linea.nombre.toLocaleLowerCase("es-AR") === nombre.toLocaleLowerCase("es-AR"),
    );

    if (existente) {
      actualizarLinea(existente.idConcepto, { monto, checked: true, tono });
      mostrarAviso({ tipo: "info", titulo: "Concepto agregado", mensaje: `${existente.nombre} se agregó al detalle.` });
      return true;
    }

    setGuardando(true);
    try {
      const concepto = await api.crearConceptoPago({ nombre });
      cambiarDetalle(({ lineas }) => ({
        lineas: [...lineas, { idConcepto: concepto.id, nombre: concepto.nombre, monto, checked: true, tono }],
      }));
      mostrarAviso({ tipo: "info", titulo: "Concepto agregado", mensaje: `${concepto.nombre} se agregó al detalle.` });
      return true;
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo agregar el concepto", mensaje: error.message });
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function subirComprobanteCobro(archivo) {
    return ejecutar(
      () => api.subirComprobanteCobro(detalle.registro.id, archivo),
      "Comprobante cargado",
      "El comprobante quedó asociado a la liquidación.",
    );
  }

  function actualizarPendientes() {
    setPendientes(null);
    setIntentosPendientes((cantidad) => cantidad + 1);
  }

  return {
    personas,
    persona,
    contrato,
    seleccion,
    anio,
    mes,
    detalle,
    cargando,
    guardando,
    error: error || (!cargando ? estado?.error : ""),
    pendientes,
    idRevision,
    revision,
    elegirRevision,
    actualizarPendientes,
    elegir,
    cambiarPeriodo,
    actualizarLinea,
    cambiarComision,
    cambiarNota,
    enviar,
    aprobar,
    rechazar: decidirPago,
    agregarConcepto,
    subirComprobanteCobro,
  };
}
