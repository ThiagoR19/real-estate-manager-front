import { api, assetUrl } from "./api";

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
  const [raw, files] = await Promise.all([api.property(id), api.propertyFiles(id)]);
  return toProperty(raw, files);
}

export async function persistProperty(form, existing) {
  const raw = existing
    ? await api.updateProperty(existing.id, propertyPayload(form))
    : await api.createProperty(propertyPayload(form));
  const id = raw.id;
  try {
    const photos = form.photos.filter((photo) => photo.file).map((photo) => photo.file);
    const documents = form.documents.filter((document) => document.file).map((document) => document.file);
    for (let i = 0; i < photos.length; i += 10) await api.uploadPropertyFiles(id, "imagenes", photos.slice(i, i + 10));
    for (let i = 0; i < documents.length; i += 5) await api.uploadPropertyFiles(id, "documentos", documents.slice(i, i + 5));
    if (existing) {
      const keptPhotos = new Set(form.photos.map((photo) => photo.id));
      const keptDocuments = new Set(form.documents.map((document) => document.id));
      for (const photo of existing.photos) {
        if (photo.id && !keptPhotos.has(photo.id)) await api.deletePropertyFile(id, "imagenes", photo.id);
      }
      for (const document of existing.documents) {
        if (document.id && !keptDocuments.has(document.id)) await api.deletePropertyFile(id, "documentos", document.id);
      }
    }
    return await getProperty(id);
  } catch (error) {
    error.propertyId = id;
    throw error;
  }
}
