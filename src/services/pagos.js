import { request } from "../utils/request.js";
import { traerTodasLasPaginas } from "../utils/paginas.js";
import { descargarArchivo, obtenerArchivo } from "../utils/descargarArchivo.js";

const formatos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const TIPOS_COMPROBANTE = formatos.join(",");

export function validarComprobante(archivo) {
  if (archivo.size === 0) return "El archivo está vacío.";
  if (archivo.size > 5 * 1024 * 1024) return "El comprobante puede pesar hasta 5 MB.";
  if (archivo.type ? !formatos.includes(archivo.type) : !/\.(pdf|jpe?g|png|webp)$/i.test(archivo.name)) {
    return "Elegí un archivo PDF, JPG, PNG o WebP.";
  }
  return "";
}

export const pagos = (filtros) => traerTodasLasPaginas("/pagos", filtros);

export const pago = (id) => request(`/pagos/${id}`).then(({ data }) => data);

export const contratosDisponiblesParaPago = () =>
  request("/pagos/contratos-disponibles").then(({ data }) => data);

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

export const marcarPagoPagado = (id, medioPago) =>
  request(`/pagos/${id}/pagado`, { method: "PATCH", body: medioPago ? { medioPago } : {} }).then(({ data }) => data);

export const descargarComprobantePago = (id, nombre = "comprobante") =>
  descargarArchivo(`/pagos/${id}/comprobante`, nombre);

export const obtenerComprobantePago = (id) => obtenerArchivo(`/pagos/${id}/comprobante`);

export const solicitarRevisionPago = (id, motivo) =>
  request(`/pagos/${id}/revision`, { method: "POST", body: { motivo } });
