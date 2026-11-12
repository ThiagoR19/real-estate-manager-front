import { request } from "../utils/request.js";

async function allPages(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await request(`${path}?page=${page}&limit=10`);
    items.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return items;
  }
}

export const contracts = () => allPages("/contratos");
export const reports = () => allPages("/reportes");
