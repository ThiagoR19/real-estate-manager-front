import { useEffect, useState } from "react";
import { api } from "../services/api";

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
    editable: !pago || PAGO_EDITABLE.includes(estado),
    puedeAprobar: Boolean(pago) && !["Aprobado", "Anulado"].includes(estado),
    puedeRechazar: estado === "En revision",
    comprobante: comprobante ? { nombre: comprobante.nombreArchivo, fecha: comprobante.fechaCarga } : null,
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
    editable: cobro ? cobro.estado === "Pendiente" : pagoAprobado,
    puedeAprobar: cobro?.estado === "Pendiente",
    puedeRechazar: false,
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
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [recargas, setRecargas] = useState(0);
  const [estado, setEstado] = useState({ clave: null, detalle: null });
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState("");

  const persona = personas?.find((item) => item.id === seleccion?.idPersona) ?? null;
  const contrato = persona?.contratos.find((item) => item.idContrato === seleccion?.idContrato) ?? null;
  const periodo = `${anio}-${String(mes).padStart(2, "0")}`;
  const clave = contrato ? `${persona.id}|${contrato.idContrato}|${periodo}|${recargas}` : null;
  const cargando = Boolean(clave) && estado.clave !== clave;
  const detalle = estado.detalle;

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
        setFeedback(error.message);
      });
    return () => {
      activo = false;
    };
  }, []);

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
        setEstado({ clave, detalle: null });
        setFeedback(error.message);
      });
    return () => {
      activo = false;
    };
  }, [clave, persona, contrato, periodo]);

  function elegir(nuevaPersona, nuevoContrato) {
    setSeleccion({ idPersona: nuevaPersona.id, idContrato: nuevoContrato.idContrato });
    setFeedback("");
  }

  function cambiarPeriodo(nuevoAnio, nuevoMes) {
    setAnio(nuevoAnio);
    setMes(nuevoMes);
    setFeedback("");
  }

  function cambiarLineas(cambiar) {
    setEstado((actual) => ({ ...actual, detalle: { ...actual.detalle, lineas: cambiar(actual.detalle.lineas) } }));
  }

  function actualizarLinea(idConcepto, cambios) {
    cambiarLineas((lineas) =>
      lineas.map((linea) => (linea.idConcepto === idConcepto ? { ...linea, ...cambios } : linea)),
    );
  }

  async function ejecutar(accion, mensaje) {
    setGuardando(true);
    setFeedback("");
    try {
      await accion();
      setFeedback(mensaje);
      setRecargas((cantidad) => cantidad + 1);
      return true;
    } catch (error) {
      setFeedback(error.message);
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function enviar() {
    const conceptos = detalle.lineas
      .filter(estaIncluida)
      .map((linea) => ({ idConcepto: linea.idConcepto, monto: parseAmount(linea.monto) }));
    const registro = detalle.registro;

    if (persona.tipo === "Locatario") {
      return ejecutar(
        () =>
          registro
            ? api.modificarPago(registro.id, {
                fechaVencimiento: new Date(registro.fechaVencimiento).toLocaleDateString("en-CA"),
                conceptos,
              })
            : api.crearPago({ idContrato: contrato.idContrato, periodo, conceptos }),
        registro ? "Se guardaron los cambios del pago." : `El pago fue enviado a ${persona.nombre}.`,
      );
    }

    return ejecutar(
      () =>
        registro
          ? api.modificarCobro(registro.id, { conceptos })
          : api.crearCobro({ idPago: detalle.pago.id, idPropietario: persona.idPropietario, conceptos }),
      registro ? "Se guardaron los cambios de la liquidación." : `La liquidación fue enviada a ${persona.nombre}.`,
    );
  }

  function aprobar() {
    return persona.tipo === "Locatario"
      ? ejecutar(() => api.aprobarPago(detalle.registro.id), "El pago fue marcado como pagado.")
      : ejecutar(() => api.marcarCobroPagado(detalle.registro.id), "La liquidación fue marcada como pagada.");
  }

  function rechazar(motivo) {
    return ejecutar(() => api.rechazarPago(detalle.registro.id, motivo), "El pago fue marcado como impagado.");
  }

  async function agregarConcepto(nombre, monto, temporal) {
    const tono = temporal ? "blue" : "green";
    const existente = detalle.lineas.find(
      (linea) => linea.nombre.toLocaleLowerCase("es-AR") === nombre.toLocaleLowerCase("es-AR"),
    );

    if (existente) {
      actualizarLinea(existente.idConcepto, { monto, checked: true, tono });
      setFeedback(`${existente.nombre} se agregó al detalle.`);
      return true;
    }

    setGuardando(true);
    try {
      const concepto = await api.crearConceptoPago({ nombre });
      cambiarLineas((lineas) => [
        ...lineas,
        { idConcepto: concepto.id, nombre: concepto.nombre, monto, checked: true, tono },
      ]);
      setFeedback(`${concepto.nombre} se agregó al detalle.`);
      return true;
    } catch (error) {
      setFeedback(error.message);
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function descargarComprobante() {
    const { registro, comprobante } = detalle;
    const descargar = persona.tipo === "Locatario" ? api.descargarComprobantePago : api.descargarComprobanteCobro;
    return descargar(registro.id, comprobante.nombre).catch((error) => setFeedback(error.message));
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
    feedback,
    setFeedback,
    elegir,
    cambiarPeriodo,
    actualizarLinea,
    enviar,
    aprobar,
    rechazar,
    agregarConcepto,
    descargarComprobante,
  };
}
