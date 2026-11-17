import { request } from "../utils/request.js";

export async function profesionales() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/profesionales?page=${page}&limit=10`);
    items.push(...(Array.isArray(result.data) ? result.data : []));
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const crearProfesional = (body) => request("/profesionales", { method: "POST", body }).then(({ data }) => data);
export const actualizarProfesional = (id, body) => request(`/profesionales/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarProfesional = (id) => request(`/profesionales/${id}`, { method: "DELETE" });
export const valorarProfesional = (id, puntuacion) => request(`/profesionales/${id}/valoraciones`, { method: "POST", body: { puntuacion } }).then(({ data }) => data);
