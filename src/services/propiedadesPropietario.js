import { request } from "../utils/request.js";

async function todasLasPaginas(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await request(`${path}?page=${page}&limit=10`);
    items.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return items;
  }
}

export const contratos = () => todasLasPaginas("/contratos");
export const reportes = () => todasLasPaginas("/reportes");
