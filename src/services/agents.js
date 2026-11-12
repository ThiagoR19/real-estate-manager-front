import { request } from "../utils/request.js";

export async function agents() {
  const rows = [];
  let page = 1;
  while (true) {
    const result = await request(`/agentes?page=${page}&limit=10`);
    rows.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) break;
    page += 1;
  }
  return rows;
}

export const createAgent = (body) =>
  request("/agentes", { method: "POST", body }).then(({ data }) => data);
export const updateAgent = (id, body) =>
  request(`/agentes/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteAgent = (id) => request(`/agentes/${id}`, { method: "DELETE" });

export function updateAgentPhoto(id, file) {
  const body = new FormData();
  body.append("fotoPerfil", file);
  return request(`/agentes/${id}/archivos/foto`, { method: "PUT", body }).then(({ data }) => data);
}
