import { request } from "../utils/request.js";
import { crearListadoPaginado } from "./listadoPaginado.js";
import { descargarArchivo, obtenerArchivo } from "../utils/descargarArchivo.js";

export const cobros = crearListadoPaginado("/cobros", { limitePredeterminado: 12, limiteMaximo: 12, admiteBusqueda: false, filtrosPermitidos: ["idPropietario", "idContrato", "estado", "anio"] });
export const cobro = (id, { signal } = {}) => request(`/cobros/${id}`, { signal }).then(({ data }) => data);
export const descargarComprobanteCobro = (id, nombre = "comprobante") => descargarArchivo(`/cobros/${id}/comprobante`, nombre);
export const obtenerComprobanteCobro = (id) => obtenerArchivo(`/cobros/${id}/comprobante`);
export const solicitarRevisionCobro = (id, motivo) => request(`/cobros/${id}/revision`, { method: "POST", body: { motivo } });
