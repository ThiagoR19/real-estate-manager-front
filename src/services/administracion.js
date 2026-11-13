import { request } from "../utils/request.js";

async function listarTodo(path) {
  const rows = [];
  for (let page = 1; ; page++) {
    const result = await request(`${path}?page=${page}&limit=10`);
    rows.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return rows;
  }
}

export const inmobiliarias = () => listarTodo("/inmobiliarias");
export const administradores = () => listarTodo("/admins");
export const crearInmobiliaria = (nombre) => request("/inmobiliarias", { method: "POST", body: { nombre } }).then(({ data }) => data);
export const crearAdministrador = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);
export const eliminarAdministrador = (id) => request(`/admins/${id}`, { method: "DELETE" });
