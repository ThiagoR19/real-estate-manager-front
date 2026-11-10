import { http, apiBase, request } from "../utils/request.js";
import { clearSession, getSession } from "./login.js";

export function assetUrl(path) {
  if (!path) return null;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).href;
}

export async function tenants() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/inquilinos?page=${page}&limit=100`);
    items.push(...result.data);
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const tenant = (id) => request(`/inquilinos/${id}`).then(({ data }) => data);
export const tenantFiles = (id) => request(`/inquilinos/${id}/archivos`).then(({ data }) => data);
export const createTenant = (body) => request("/inquilinos", { method: "POST", body }).then(({ data }) => data);
export const updateTenant = (id, body) => request(`/inquilinos/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteTenant = (id) => request(`/inquilinos/${id}`, { method: "DELETE" });

export function uploadTenantFiles(id, kind, files) {
  const body = new FormData();
  for (const file of files) body.append(kind, file);
  return request(`/inquilinos/${id}/archivos/${kind}`, { method: "POST", body });
}

export const deleteTenantFile = (id, kind, fileId) => request(`/inquilinos/${id}/archivos/${kind}/${fileId}`, { method: "DELETE" });

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
      try { payload = JSON.parse(await payload.text()); }
      catch (parseError) { console.log(parseError); }
    }
    throw new Error(payload?.error?.mensaje || (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."), { cause: error });
  }
}


export function toTenant(raw, files = {}) {
  return {
    id: raw.id,
    idInmobiliaria: raw.idInmobiliaria,
    idPersona: raw.idPersona,
    activo: Boolean(raw.activo),
    nombre: raw.nombre,
    apellido: raw.apellido,
    correo: raw.correo || "Correo sin especificar..",
    dni: raw.dni,
    telefono: raw.telefono || "Teléfono sin especificar.",
    direccion: raw.direccion || "Dirección Sin especificar.",
    idUsuario: raw.idUsuario,
    usuario: raw.usuario,
    fotoPerfil: (files.imagenes || raw.imagenes || []).map((image) => ({
      id: image.id, src: assetUrl(image.url), alt: `Foto de ${raw.nombre}`,
    })),
  };
}

export function tenantPayload(form) {
  return {
    nombre: form.name.trim(),
    apellido: form.apellido.trim(),
    dni: Number(form.dni),
    correo: form.correo.trim(),
    telefono: form.telefono.trim(),
    idInmobiliaria: Number(form.idInmobiliaria).trim(),
    activo: Boolean(form.activo),
  };
}

export async function getTenant(id) {
  const [raw, files] = await Promise.all([tenant(id), tenantFiles(id)]);
  return toTenant(raw, files);
}

export async function persistTenant(form, existing) {
  const raw = existing ? await updateTenant(existing.id, tenantPayload(form)) : await createTenant(tenantPayload(form));
  const id = raw.id;
  try {
    const photos = form.photos.filter((photo) => photo.file).map((photo) => photo.file);
    const documents = form.documents.filter((document) => document.file).map((document) => document.file);
    for (let i = 0; i < photos.length; i += 10) await uploadTenantFiles(id, "imagenes", photos.slice(i, i + 10));
    for (let i = 0; i < documents.length; i += 5) await uploadTenantFiles(id, "documentos", documents.slice(i, i + 5));
    if (existing) {
      const keptPhotos = new Set(form.photos.map((photo) => photo.id));
      const keptDocuments = new Set(form.documents.map((document) => document.id));
      for (const photo of existing.photos) {
        if (photo.id && !keptPhotos.has(photo.id)) await deleteTenantFile(id, "imagenes", photo.id);
      }
      for (const document of existing.documents) {
        if (document.id && !keptDocuments.has(document.id)) await deleteTenantFile(id, "documentos", document.id);
      }
    }
    return await getTenant(id);
  } catch (error) {
    error.tenantId = id;
    throw error;
  }
}
