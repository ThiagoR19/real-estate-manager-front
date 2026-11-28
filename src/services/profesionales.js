import { crearListadoPaginado } from "./listadoPaginado.js";
import { request } from "../utils/request.js";

export const profesionales = crearListadoPaginado("/profesionales", { filtrosPermitidos: ["idInmobiliaria", "profesion"] });
export const profesiones = () => request("/profesionales/profesiones").then(({ data }) => data);

export const crearProfesional = (body) => request("/profesionales", { method: "POST", body }).then(({ data }) => data);
export const actualizarProfesional = (id, body) => request(`/profesionales/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarProfesional = (id) => request(`/profesionales/${id}`, { method: "DELETE" });
export const valorarProfesional = (id, puntuacion) => request(`/profesionales/${id}/valoraciones`, { method: "POST", body: { puntuacion } }).then(({ data }) => data);
