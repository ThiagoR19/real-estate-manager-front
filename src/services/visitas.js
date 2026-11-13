import { request } from "../utils/request.js";

export function visitas(filtros = {}) {
  const query = new URLSearchParams(filtros).toString();
  return request(`/visitas?${query}`);
}

export async function todasLasVisitas() {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await visitas({ page, limit: 10 });
    items.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return items;
  }
}

export const clientesVisitas = () => request("/visitas/clientes").then(({ data }) => data);
export const crearClienteVisita = (body) => request("/visitas/clientes", { method: "POST", body }).then(({ data }) => data);
export const crearVisita = (body) => request("/visitas", { method: "POST", body }).then(({ data }) => data);
export const actualizarVisita = (id, body) => request(`/visitas/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const cancelarVisita = (id, motivo) => request(`/visitas/${id}/cancelar`, { method: "PATCH", body: { motivo, confirmacion: true } }).then(({ data }) => data);
