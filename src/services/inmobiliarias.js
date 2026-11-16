import { request } from "../utils/request.js";

async function todasLasPaginas(ruta) {
  const filas = [];
  let pagina = 1;
  while (true) {
    const resultado = await request(`${ruta}?page=${pagina}&limit=10`);
    filas.push(...resultado.data);
    if (pagina >= (resultado.paginacion?.paginas || 1)) break;
    pagina += 1;
  }
  return filas;
}

// GET (solo superadmin)
export const inmobiliarias = () => todasLasPaginas("/inmobiliarias");
export const todosLosAdministradores = () => todasLasPaginas("/admins");
export const todosLosAgentes = () => todasLasPaginas("/agentes");

export async function panelSuperAdmin() {
  const [lista, admins, agentes] = await Promise.all([inmobiliarias(), todosLosAdministradores(), todosLosAgentes()]);
  return lista.map((inmobiliaria) => ({
    ...inmobiliaria,
    admins: admins.filter((admin) => admin.idInmobiliaria === inmobiliaria.id),
    agentes: agentes.filter((agente) => agente.idInmobiliaria === inmobiliaria.id),
  }));
}
export const crearInmobiliaria = (body) => request("/inmobiliarias", { method: "POST", body }).then(({ data }) => data);

export const eliminarInmobiliaria = (id) => request(`/inmobiliarias/${id}`, { method: "DELETE" });

export const eliminarAdministrador = (id) => request(`/admins/${id}`, { method: "DELETE" });


export const renombrarInmobiliaria = (id, nombre) =>
  request(`/inmobiliarias/${id}`, { method: "PATCH", body: { nombre } }).then(({ data }) => data);

export const crearAdministrador = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);

export const administradorAAgente = (id) => request(`/admins/${id}/agente`, { method: "PATCH" }).then(({ data }) => data);

export const agenteAAdministrador = (id) => request(`/agentes/${id}/ADMIN`, { method: "PATCH" }).then(({ data }) => data);
