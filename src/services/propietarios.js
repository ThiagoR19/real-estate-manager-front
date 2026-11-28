import { crearListadoPaginado } from "./listadoPaginado.js";
import { request } from "../utils/request.js";

export const propietarios = crearListadoPaginado("/propietarios", { filtrosPermitidos: ["idInmobiliaria"] });

export const resumenPropietarios = () => request("/propietarios/resumen").then(({ data }) => data);

export const crearPropietario = (body) => request("/propietarios", { method: "POST", body }).then(({ data }) => data);
export const generarEnlacePropietario = (id) => request(`/propietarios/${id}/activacion`, { method: "POST" }).then(({ data }) => data.activacion);
export const actualizarPropietario = (id, body) => request(`/propietarios/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarPropietario = (id) => request(`/propietarios/${id}`, { method: "DELETE" });
