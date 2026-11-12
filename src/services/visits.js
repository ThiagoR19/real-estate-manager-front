import { request } from "../utils/request.js";

export function visits(filtros = {}) {
  const query = new URLSearchParams(filtros).toString();
  return request(`/visitas?${query}`);
}

export async function allVisits() {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await visits({ page, limit: 10 });
    items.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return items;
  }
}

export const visitClients = () => request("/visitas/clientes").then(({ data }) => data);
export const createVisitClient = (body) => request("/visitas/clientes", { method: "POST", body }).then(({ data }) => data);
export const createVisit = (body) => request("/visitas", { method: "POST", body }).then(({ data }) => data);
export const updateVisit = (id, body) => request(`/visitas/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const cancelVisit = (id, motivo) => request(`/visitas/${id}/cancelar`, { method: "PATCH", body: { motivo, confirmacion: true } }).then(({ data }) => data);
