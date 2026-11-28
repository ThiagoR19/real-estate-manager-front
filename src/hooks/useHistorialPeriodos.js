import { useEffect, useState } from "react";
import useListadoPaginado from "./useListadoPaginado.js";
import { api } from "../services/api.js";

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

export function nombreMes(periodo) {
  return MESES[Number(periodo.slice(5, 7)) - 1];
}

export function nombrePeriodo(periodo) {
  return `${nombreMes(periodo)} ${periodo.slice(0, 4)}`;
}

const ZONA = "America/Argentina/Buenos_Aires";

export function formatearFecha(valor) {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor.split("-").reverse().join("/");
  return new Date(valor).toLocaleDateString("es-AR", { timeZone: ZONA, day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatearFechaHora(valor) {
  if (!valor) return "—";
  const hora = new Date(valor).toLocaleTimeString("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatearFecha(valor)} · ${hora} hs`;
}

export function formatearMonto(valor) {
  if (valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function etiquetarContratos(contratos) {
  const repetidos = new Map();
  for (const { propiedad } of contratos) repetidos.set(propiedad, (repetidos.get(propiedad) ?? 0) + 1);
  return contratos.map((contrato) => {
    const { propiedad, idContrato } = contrato;
    const etiqueta = repetidos.get(propiedad) > 1 ? `${propiedad} · Contrato ${idContrato}` : propiedad;
    return { ...contrato, etiqueta };
  });
}

export default function useHistorialPeriodos(listar, consultar, tipo = "pagos") {
  const [contratoElegido, setContratoElegido] = useState(null);
  const [periodoElegido, setPeriodoElegido] = useState(null);
  const [anio, setAnio] = useState("");
  const [recargas, setRecargas] = useState(0);
  const [estado, setEstado] = useState({ clave: null, detalle: null });
  const catalogo = useListadoPaginado(api.contratos);
  const contratos = etiquetarContratos(catalogo.datos.map((contrato) => ({ ...contrato, idContrato: contrato.id })));
  const idContrato = contratoElegido ?? contratos[0]?.idContrato;
  const filtros = { idContrato, anio: anio || undefined };
  const listado = useListadoPaginado(listar, { filtros, limite: 12, habilitada: Boolean(idContrato), version: recargas });
  const totalContrato = useListadoPaginado(listar, { filtros: { idContrato }, limite: 1, habilitada: Boolean(idContrato), version: recargas });
  const aprobados = useListadoPaginado(listar, { filtros: { idContrato, estado: tipo === "cobros" ? "Liquidado" : "Aprobado" }, limite: 1, habilitada: Boolean(idContrato), version: recargas });
  const rechazados = useListadoPaginado(listar, { filtros: { idContrato, estado: tipo === "cobros" ? "Pendiente" : "Rechazado" }, limite: 1, habilitada: Boolean(idContrato), version: recargas });
  const cargando = catalogo.cargando || listado.cargando;
  const items = cargando ? null : listado.datos;
  const delContrato = listado.datos;
  const seleccionado = delContrato.find((item) => item.id === periodoElegido || item.periodo === periodoElegido) ?? delContrato[0] ?? null;
  const idSeleccionado = seleccionado?.id;
  const clave = idSeleccionado == null ? null : `${idSeleccionado}|${recargas}`;

  useEffect(() => {
    if (!clave) return undefined;
    let activo = true;
    const controlador = new AbortController();
    consultar(idSeleccionado, { signal: controlador.signal })
      .then((detalle) => { if (activo) setEstado({ clave, detalle }); })
      .catch((error) => { if (activo && !controlador.signal.aborted) setEstado({ clave, detalle: null, error: error.message }); });
    return () => { activo = false; controlador.abort(); };
  }, [consultar, clave, idSeleccionado]);

  const anios = [...new Set(delContrato.map((item) => item.periodo.slice(0, 4)))].map((anio) => ({
    anio, periodos: delContrato.filter((item) => item.periodo.startsWith(anio)),
  }));
  const detalle = estado.clave === clave && estado.detalle ? estado.detalle : seleccionado;
  const contrato = contratos.find((item) => item.idContrato === idContrato) ??
    (idContrato ? { idContrato, etiqueta: seleccionado?.propiedad || `Contrato #${idContrato}` } : null);

  function recargar() { setRecargas((cantidad) => cantidad + 1); }
  function elegirContrato(nuevoId, periodo = null) {
    setContratoElegido(nuevoId);
    setPeriodoElegido(periodo);
    setAnio(typeof periodo === "string" && /^\d{4}-\d{2}$/.test(periodo) ? periodo.slice(0, 4) : "");
  }
  function incorporar(item) {
    elegirContrato(item.idContrato, item.periodo);
    setPeriodoElegido(item.id);
    recargar();
  }
  function moverContrato(direccion) {
    if (!contratos.length) return;
    const indice = contratos.findIndex((contrato) => contrato.idContrato === idContrato);
    elegirContrato(contratos[(indice + direccion + contratos.length) % contratos.length].idContrato);
  }
  return {
    items, error: catalogo.error || listado.error, contratos, contrato, delContrato, anios, anio,
    cambiarAnio: setAnio, seleccionado, detalle, cargando,
    catalogo, listado,
    totales: { total: totalContrato.paginacion?.total, aprobados: aprobados.paginacion?.total, rechazados: rechazados.paginacion?.total },
    errorResumen: totalContrato.error || aprobados.error || rechazados.error,
    cargandoDetalle: Boolean(clave) && estado.clave !== clave,
    errorDetalle: estado.clave === clave ? estado.error : null,
    elegirContrato, moverContrato, elegir: setPeriodoElegido, incorporar, recargar,
  };
}
