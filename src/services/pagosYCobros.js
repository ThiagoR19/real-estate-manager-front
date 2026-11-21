import { request } from "../utils/request.js";
import { queryDe } from "../utils/paginas.js";

const datos = ({ data }) => data;
export const conceptosPago = () => request("/pagos/conceptos").then(datos);
export const crearConceptoPago = (body) => request("/pagos/conceptos", { method: "POST", body }).then(datos);
export const inquilinosConAlquiler = (busqueda) => request(`/pagos/inquilinos?${queryDe({ q: busqueda })}`).then(datos);
export const propietariosConAlquiler = (busqueda) => request(`/cobros/propietarios?${queryDe({ q: busqueda })}`).then(datos);
export const prepararPago = (idContrato, periodo) => request(`/pagos/preparar?${queryDe({ idContrato, periodo })}`).then(datos);
export const crearPago = (body) => request("/pagos", { method: "POST", body }).then(datos);
export const modificarPago = (id, body) => request(`/pagos/${id}`, { method: "PUT", body }).then(datos);
export const eliminarPago = (id) => request(`/pagos/${id}`, { method: "DELETE" }).then(datos);

export const aprobarPago = (id, medioPago, idComprobante) =>
  request(`/pagos/${id}/aprobar`, {
    method: "PATCH",
    body: { medioPago: medioPago || undefined, idComprobante },
  }).then(datos);

export const rechazarPago = (id, motivo, idComprobante) => request(`/pagos/${id}/rechazar`, { method: "PATCH", body: { motivo, idComprobante } }).then(datos);
export const prepararCobro = (idContrato, idPropietario, periodo) => request(`/cobros/preparar?${queryDe({ idContrato, idPropietario, periodo })}`).then(datos);
export const crearCobro = (body) => request("/cobros", { method: "POST", body }).then(datos);
export const modificarCobro = (id, body) => request(`/cobros/${id}`, { method: "PUT", body }).then(datos);
export const eliminarCobro = (id) => request(`/cobros/${id}`, { method: "DELETE" }).then(datos);

export function subirComprobanteCobro(id, archivo) {
  const body = new FormData();
  body.append("comprobante", archivo);
  return request(`/cobros/${id}/comprobante`, { method: "POST", body }).then(datos);
}

export const marcarCobroPagado = (id) => request(`/cobros/${id}/pagado`, { method: "PATCH" }).then(datos);
