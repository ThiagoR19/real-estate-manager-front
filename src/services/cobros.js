import { request } from "../utils/request.js";
import { traerTodasLasPaginas } from "../utils/paginas.js";
import { descargarArchivo, obtenerArchivo } from "../utils/descargarArchivo.js";

export const cobros = (filtros) => traerTodasLasPaginas("/cobros", filtros);

export const cobro = (id) => request(`/cobros/${id}`).then(({ data }) => data);

export const descargarComprobanteCobro = (id, nombre = "comprobante") =>
  descargarArchivo(`/cobros/${id}/comprobante`, nombre);

export const obtenerComprobanteCobro = (id) => obtenerArchivo(`/cobros/${id}/comprobante`);

export const solicitarRevisionCobro = (id, motivo) =>
  request(`/cobros/${id}/revision`, { method: "POST", body: { motivo } });
