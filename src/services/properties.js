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
    const result = await request(`/propiedades?page=${page}&limit=100`);
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

export function toProperty(raw, files = {}) {
  return {
    id: raw.id,
    name: raw.nombre,
    title: raw.nombre,
    type: raw.tipo,
    typeId: raw.idTipo,
    status: raw.estadoComercial,
    statusId: raw.idEstadoComercial,
    agentId: raw.idAgente,
    location: raw.ubicacion || "Ubicación sin especificar",
    description: raw.descripcion || "Sin descripción.",
    bedrooms: raw.habitaciones ?? 0,
    bathrooms: raw.banos ?? 0,
    area: raw.tamano ?? 0,
    age: raw.antiguedad ?? 0,
    price: raw.precio ?? "",
    currency: raw.moneda,
    published: Boolean(raw.publicada),
    createdAt: raw.fechaCreacion,
    photos: (files.imagenes || raw.imagenes || []).map((image) => ({
      id: image.id, src: assetUrl(image.url), alt: `Foto de ${raw.nombre}`,
    })),
    documents: (files.documentos || []).map((document) => ({
      id: document.id, name: document.titulo, fileName: document.nombreArchivo,
    })),
  };
}

export function propertyPayload(form) {
  return {
    nombre: form.name.trim(),
    idTipo: Number(form.typeId),
    idEstadoComercial: Number(form.statusId),
    idAgente: form.agentId ? Number(form.agentId) : null,
    descripcion: form.description.trim() || null,
    ubicacion: form.location.trim() || null,
    habitaciones: Number(form.bedrooms),
    banos: Number(form.bathrooms),
    tamano: Number(form.area) > 0 ? Number(form.area) : null,
    antiguedad: Number(form.age),
    precio: form.price === "" ? null : Number(form.price),
    moneda: form.currency,
    publicada: Boolean(form.published),
  };
}

export async function getProperty(id) {
  const [raw, files] = await Promise.all([property(id), propertyFiles(id)]);
  return toProperty(raw, files);
}

export async function persistProperty(form, existing) {
  const raw = existing
    ? await updateProperty(existing.id, propertyPayload(form))
    : await createProperty(propertyPayload(form));
  const id = raw.id;
  try {
    const photos = form.photos.filter((photo) => photo.file).map((photo) => photo.file);
    const documents = form.documents.filter((document) => document.file).map((document) => document.file);
    for (let i = 0; i < photos.length; i += 10) await uploadPropertyFiles(id, "imagenes", photos.slice(i, i + 10));
    for (let i = 0; i < documents.length; i += 5) await uploadPropertyFiles(id, "documentos", documents.slice(i, i + 5));
    if (existing) {
      const keptPhotos = new Set(form.photos.map((photo) => photo.id));
      const keptDocuments = new Set(form.documents.map((document) => document.id));
      for (const photo of existing.photos) {
        if (photo.id && !keptPhotos.has(photo.id)) await deletePropertyFile(id, "imagenes", photo.id);
      }
      for (const document of existing.documents) {
        if (document.id && !keptDocuments.has(document.id)) await deletePropertyFile(id, "documentos", document.id);
      }
    }
    return await getProperty(id);
  } catch (error) {
    error.propertyId = id;
    throw error;
  }
}
