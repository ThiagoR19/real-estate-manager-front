import { request } from "../utils/request.js";
import { crearListadoPaginado } from "./listadoPaginado.js";

export const inmobiliarias = crearListadoPaginado("/inmobiliarias", { admiteBusqueda: false });
export const todosLosAdministradores = crearListadoPaginado("/admins", { admiteBusqueda: false });
export const todosLosAgentes = crearListadoPaginado("/agentes", { filtrosPermitidos: ["idInmobiliaria"] });

export const crearInmobiliaria = (body) => request("/inmobiliarias", { method: "POST", body }).then(({ data }) => data);
export const eliminarInmobiliaria = (id) => request(`/inmobiliarias/${id}`, { method: "DELETE" });
export const eliminarAdministrador = (id) => request(`/admins/${id}`, { method: "DELETE" });
export const renombrarInmobiliaria = (id, nombre) => request(`/inmobiliarias/${id}`, { method: "PATCH", body: { nombre } }).then(({ data }) => data);
export const crearAdministrador = (body) => request("/admins", { method: "POST", body }).then(({ data }) => data);
export const generarEnlaceAdministrador = (id) => request(`/admins/${id}/activacion`, { method: "POST" }).then(({ data }) => data.activacion);
export const administradorAAgente = (id) => request(`/admins/${id}/agente`, { method: "PATCH" }).then(({ data }) => data);
export const agenteAAdministrador = (id) => request(`/agentes/${id}/ADMIN`, { method: "PATCH" }).then(({ data }) => data);
