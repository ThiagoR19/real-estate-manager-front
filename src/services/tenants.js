import { http, request } from "../utils/request.js";
import { clearSession, getSession } from "./login.js";

export async function tenants() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/inquilinos?page=${page}&limit=10`);
    items.push(...(Array.isArray(result.data) ? result.data : []));
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const tenant = (id) => request(`/inquilinos/${id}`).then(({ data }) => data);
export const tenantFiles = (id) => request(`/inquilinos/${id}/archivos`).then(({ data }) => data);
export const createTenant = (body) =>
  request("/inquilinos", { method: "POST", body }).then(({ data }) => data);
export const updateTenant = (id, body) =>
  request(`/inquilinos/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteTenant = (id) => request(`/inquilinos/${id}`, { method: "DELETE" });

export function uploadTenantFiles(id, kind, files) {
  const body = new FormData();
  for (const file of files) body.append(kind, file);
  return request(`/inquilinos/${id}/archivos/${kind}`, { method: "POST", body });
}

export const deleteTenantFile = (id, kind, fileId) =>
  request(`/inquilinos/${id}/archivos/${kind}/${fileId}`, { method: "DELETE" });

export async function downloadTenantDocument(id, file) {
  try {
    const { data } = await http.get(`/inquilinos/${id}/archivos/documentos/${file.id}`, {
      headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      clearSession();
      window.location.assign("/login");
    }
    let payload = error.response?.data;
    if (payload instanceof Blob) {
      try {
        payload = JSON.parse(await payload.text());
      } catch (parseError) {
        console.log(parseError);
      }
    }
    throw new Error(
      payload?.error?.mensaje ||
        (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."),
      { cause: error },
    );
  }
}
