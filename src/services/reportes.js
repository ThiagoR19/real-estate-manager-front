import { request } from "../utils/request.js";

export const catalogosReportes = () => request("/reportes/catalogos").then(({ data }) => data);
export const crearReporte = (body) => request("/reportes", { method: "POST", body }).then(({ data }) => data);
export const actualizarReporte = (id, body) => request(`/reportes/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const subirImagenesReporte = (id, files) => {
  const body = new FormData();
  files.forEach((file) => body.append("imagenes", file));
  return request(`/reportes/${id}/archivos/imagenes`, { method: "POST", body }).then(({ data }) => data);
};
