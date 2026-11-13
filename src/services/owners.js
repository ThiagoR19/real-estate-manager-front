import { request } from "../utils/request.js";

export async function owners() {
  const rows = [];
  for (let page = 1; ; page++) {
    const result = await request(`/propietarios?page=${page}&limit=10`);
    rows.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return rows;
  }
}

export const createOwner = (body) => request("/propietarios", { method: "POST", body }).then(({ data }) => data);
export const updateOwner = (id, body) => request(`/propietarios/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteOwner = (id) => request(`/propietarios/${id}`, { method: "DELETE" });
