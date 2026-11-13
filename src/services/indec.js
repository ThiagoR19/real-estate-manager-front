import { request } from "../utils/request.js";

export const indec = (anio) => request(`/indec?anio=${anio}`).then(({ data }) => data);
export const crearIndec = (body) => request("/indec", { method: "POST", body }).then(({ data }) => data);
