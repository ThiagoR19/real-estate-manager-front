import { crearListadoPaginado } from "./listadoPaginado.js";
import { request } from "../utils/request.js";

export const areas = () => request("/areas").then(({ data }) => data);
export const agentes = crearListadoPaginado("/agentes", { filtrosPermitidos: ["idInmobiliaria"] });
export const crearAgente = (body) => request("/agentes", { method: "POST", body }).then(({ data }) => data);
export const generarEnlaceAgente = (id) => request(`/agentes/${id}/activacion`, { method: "POST" }).then(({ data }) => data.activacion);
export const actualizarAgente = (id, body) => request(`/agentes/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarAgente = (id) => request(`/agentes/${id}`, { method: "DELETE" });
