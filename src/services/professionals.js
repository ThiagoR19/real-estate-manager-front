import { request } from "../utils/request.js";

export async function professionals() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/profesionales?page=${page}&limit=100`);
    items.push(...(Array.isArray(result.data) ? result.data : []));
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const createProfessional = (body) => request("/profesionales", { method: "POST", body }).then(({ data }) => data);
export const updateProfessional = (id, body) => request(`/profesionales/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteProfessional = (id) => request(`/profesionales/${id}`, { method: "DELETE" });
