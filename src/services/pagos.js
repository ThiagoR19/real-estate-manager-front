import { request } from "../utils/request.js";
import { traerTodasLasPaginas } from "../utils/paginas.js";
import { descargarArchivo, obtenerArchivo } from "../utils/descargarArchivo.js";

export const pagos = (filtros) => traerTodasLasPaginas("/pagos", filtros);
export const pago = (id) => request(`/pagos/${id}`).then(({ data }) => data);

export const contratosDisponiblesParaPago = () => request("/pagos/contratos-disponibles").then(({ data }) => data);

export function registrarPagoConComprobante(idContrato, periodo, archivo) {
  const body = new FormData();
  body.append("comprobante", archivo);
  return request(`/pagos/contratos/${idContrato}/periodos/${periodo}/comprobante`, {
    method: "POST",
    body,
  }).then(({ data }) => data);
}

export function subirComprobantePago(id, archivo, { enviar = false } = {}) {
  const body = new FormData();
  body.append("comprobante", archivo);
  const ruta = `/pagos/${id}/comprobante${enviar ? "?enviar=1" : ""}`;
  return request(ruta, { method: "POST", body }).then(({ data }) => data);
}

export const marcarPagoPagado = (id, medioPago) => request(`/pagos/${id}/pagado`, { method: "PATCH", body: medioPago ? { medioPago } : {} }).then(({ data }) => data);
export const descargarComprobantePago = (id, nombre = "comprobante") => descargarArchivo(`/pagos/${id}/comprobante`, nombre);
export const obtenerComprobantePago = (id) => obtenerArchivo(`/pagos/${id}/comprobante`);
export const solicitarRevisionPago = (id, motivo) => request(`/pagos/${id}/revision`, { method: "POST", body: { motivo } });
