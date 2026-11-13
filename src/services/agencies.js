import { request } from "../utils/request.js";

// Trae todas las páginas de un listado paginado del backend
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
export const agencies = () => todasLasPaginas("/inmobiliarias");
export const allAdmins = () => todasLasPaginas("/admins");
export const allAgents = () => todasLasPaginas("/agentes");

// Inmobiliarias con sus admins y agentes agrupados por idInmobiliaria
export async function superAdminPanel() {
  const [inmobiliarias, admins, agentes] = await Promise.all([agencies(), allAdmins(), allAgents()]);
  return inmobiliarias.map((inmobiliaria) => ({
    ...inmobiliaria,
    admins: admins.filter((admin) => admin.idInmobiliaria === inmobiliaria.id),
    agentes: agentes.filter((agente) => agente.idInmobiliaria === inmobiliaria.id),
  }));
}
export const crearInmobi = (body) => request("/inmobiliarias", { method: "POST", body }).then(({ data }) => data);

// Borra la inmobiliaria y TODO lo que depende de ella (usuarios, propiedades, contratos...)
export const eliminarInmobi = (id) => request(`/inmobiliarias/${id}`, { method: "DELETE" });

// id = id de usuario del admin (el que devuelve GET /admins)
export const eliminarAdmin = (id) => request(`/admins/${id}`, { method: "DELETE" });

// Para borrar agentes se usa api.deleteAgent (DELETE /agentes/:id, en services/agents.js)

// Solo cambia el nombre (PATCH de superadmin)
export const renombrarInmobi = (id, nombre) =>
  request(`/inmobiliarias/${id}`, { method: "PATCH", body: { nombre } }).then(({ data }) => data);

// body: { idInmobiliaria, nombre, apellido, usuario, password, correo?, dni?, telefono?, direccion? }
// La cuenta queda pendiente de activación; la respuesta trae activacion.codigo y activacion.enlace
export const crearAdmin = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);

// id = id de usuario del admin
export const adminAAgente = (id) => request(`/admins/${id}/agente`, { method: "PATCH" }).then(({ data }) => data);

// id = id de agente
export const agenteAAdmin = (id) => request(`/agentes/${id}/ADMIN`, { method: "PATCH" }).then(({ data }) => data);
