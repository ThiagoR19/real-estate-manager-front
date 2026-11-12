import { request } from "../utils/request.js";

export function visits(filtros = {}) {
  const query = new URLSearchParams(filtros).toString();
  return request(`/visitas?${query}`);
}
