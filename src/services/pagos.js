import { request } from "../utils/request.js";
import { traerTodasLasPaginas } from "../utils/paginas.js";
import { descargarArchivo } from "../utils/descargarArchivo.js";

export const pagos = (filtros) => traerTodasLasPaginas("/pagos", filtros);

export const pago = (id) => request(`/pagos/${id}`).then(({ data }) => data);

export function subirComprobantePago(id, archivo) {
  const body = new FormData();
  body.append("comprobante", archivo);
  return request(`/pagos/${id}/comprobante`, { method: "POST", body }).then(({ data }) => data);
}

export const marcarPagoPagado = (id, medioPago) =>
  request(`/pagos/${id}/pagado`, { method: "PATCH", body: medioPago ? { medioPago } : {} }).then(({ data }) => data);

export const descargarComprobantePago = (id, nombre = "comprobante") =>
  descargarArchivo(`/pagos/${id}/comprobante`, nombre);
