import { request } from "../utils/request.js";

async function listAll(path) {
  const rows = [];
  for (let page = 1; ; page++) {
    const result = await request(`${path}?page=${page}&limit=10`);
    rows.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return rows;
  }
}

export const agencies = () => listAll("/inmobiliarias");
export const admins = () => listAll("/admins");
export const createAgency = (nombre) => request("/inmobiliarias", { method: "POST", body: { nombre } }).then(({ data }) => data);
export const createAdmin = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);
export const deleteAdmin = (id) => request(`/admins/${id}`, { method: "DELETE" });
