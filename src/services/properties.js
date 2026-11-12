import { http, apiBase, request } from "../utils/request.js";
import { clearSession, getSession } from "./login.js";

export function assetUrl(path) {
  if (!path) return null;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).href;
}

export const propertyCatalogs = () => request("/propiedades/catalogos").then(({ data }) => data);

export async function properties() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/propiedades?page=${page}&limit=12`);
    items.push(...result.data);
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const property = (id) => request(`/propiedades/${id}`).then(({ data }) => data);
export const propertyFiles = (id) => request(`/propiedades/${id}/archivos`).then(({ data }) => data);
export const createProperty = (body) => request("/propiedades", { method: "POST", body }).then(({ data }) => data);
export const updateProperty = (id, body) => request(`/propiedades/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteProperty = (id) => request(`/propiedades/${id}`, { method: "DELETE" });

export function uploadPropertyFiles(id, kind, files) {
  const body = new FormData();
  for (const file of files) body.append(kind, file);
  return request(`/propiedades/${id}/archivos/${kind}`, { method: "POST", body });
}

export const deletePropertyFile = (id, kind, fileId) => request(`/propiedades/${id}/archivos/${kind}/${fileId}`, { method: "DELETE" });

export async function downloadPropertyDocument(id, file) {
  try {
    const { data } = await http.get(`/propiedades/${id}/archivos/documentos/${file.id}`, {
      headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = file.nombreArchivo;
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

export async function getProperty(id) {
  const [raw, files] = await Promise.all([property(id), propertyFiles(id)]);
  return { ...raw, imagenes: files.imagenes || [], documentos: files.documentos || [] };
}
