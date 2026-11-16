import { request } from "./request.js";

export function queryDe(parametros = {}) {
  const query = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") query.set(clave, valor);
  });
  return query.toString();
}

export async function traerTodasLasPaginas(ruta, filtros = {}) {
  const items = [];
  for (let page = 1; ; page++) {
    const { data, paginacion } = await request(`${ruta}?${queryDe({ ...filtros, page, limit: 12 })}`);
    items.push(...data);
    if (page >= (paginacion?.paginas || 1)) return items;
  }
}
