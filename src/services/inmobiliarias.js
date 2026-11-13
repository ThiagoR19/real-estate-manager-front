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
export const inmobiliarias = () => todasLasPaginas("/inmobiliarias");
export const todosLosAdministradores = () => todasLasPaginas("/admins");
export const todosLosAgentes = () => todasLasPaginas("/agentes");

// Inmobiliarias con sus admins y agentes agrupados por idInmobiliaria
export async function panelSuperAdmin() {
  const [inmobiliarias, admins, agentes] = await Promise.all([inmobiliarias(), todosLosAdministradores(), todosLosAgentes()]);
  return inmobiliarias.map((inmobiliaria) => ({
    ...inmobiliaria,
    admins: admins.filter((admin) => admin.idInmobiliaria === inmobiliaria.id),
    agentes: agentes.filter((agente) => agente.idInmobiliaria === inmobiliaria.id),
  }));
}
export const crearInmobiliaria = (body) => request("/inmobiliarias", { method: "POST", body }).then(({ data }) => data);

// Borra la inmobiliaria y TODO lo que depende de ella (usuarios, propiedades, contratos...)
export const eliminarInmobiliaria = (id) => request(`/inmobiliarias/${id}`, { method: "DELETE" });

// id = id de usuario del admin (el que devuelve GET /admins)
export const eliminarAdministrador = (id) => request(`/admins/${id}`, { method: "DELETE" });

// Para borrar agentes se usa api.eliminarAgente (DELETE /agentes/:id, en services/agentes.js)

// Solo cambia el nombre (PATCH de superadmin)
export const renombrarInmobiliaria = (id, nombre) =>
  request(`/inmobiliarias/${id}`, { method: "PATCH", body: { nombre } }).then(({ data }) => data);

// body: { idInmobiliaria, nombre, apellido, usuario, password, correo?, dni?, telefono?, direccion? }
// La cuenta queda pendiente de activación; la respuesta trae activacion.codigo y activacion.enlace
export const crearAdministrador = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);

// id = id de usuario del admin
export const administradorAAgente = (id) => request(`/admins/${id}/agente`, { method: "PATCH" }).then(({ data }) => data);

// id = id de agente
export const agenteAAdministrador = (id) => request(`/agentes/${id}/ADMIN`, { method: "PATCH" }).then(({ data }) => data);
