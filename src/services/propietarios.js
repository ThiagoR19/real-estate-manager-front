import { request } from "../utils/request.js";

export async function propietarios() {
  const rows = [];
  for (let page = 1; ; page++) {
    const result = await request(`/propietarios?page=${page}&limit=10`);
    rows.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return rows;
  }
}

export const crearPropietario = (body) => request("/propietarios", { method: "POST", body }).then(({ data }) => data);
export const generarEnlacePropietario = (id) => request(`/propietarios/${id}/activacion`, { method: "POST" }).then(({ data }) => data.activacion);
export const actualizarPropietario = (id, body) => request(`/propietarios/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarPropietario = (id) => request(`/propietarios/${id}`, { method: "DELETE" });
