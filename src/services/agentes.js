import { request } from "../utils/request.js";

export const areas = () => request("/areas").then(({ data }) => data);

export async function agentes() {
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

export const crearAgente = (body) => request("/agentes", { method: "POST", body }).then(({ data }) => data);
export const generarEnlaceAgente = (id) => request(`/agentes/${id}/activacion`, { method: "POST" }).then(({ data }) => data.activacion);
export const actualizarAgente = (id, body) => request(`/agentes/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarAgente = (id) => request(`/agentes/${id}`, { method: "DELETE" });
