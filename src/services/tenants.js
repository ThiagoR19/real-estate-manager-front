import { http, apiBase, request } from "../utils/request.js";
import { clearSession, getSession } from "./login.js";
import initials from "../utils/initials.js";

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
    items.push(...(Array.isArray(result.data) ? result.data : []));
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
  const nombre = [raw.nombre, raw.apellido].filter(Boolean).join(" ").trim();
  const estado = !raw.activo
    ? "Inactivo"
    : raw.estadoCuenta === "PENDIENTE_ACTIVACION"
      ? "Pendiente"
      : "Activo";

  let iniciales = initials(raw.nombre, raw.apellido)
  console.log(iniciales)

  return {
    id: raw.id,
    idInmobiliaria: raw.idInmobiliaria,
    idPersona: raw.idPersona,
    activo: Boolean(Number(raw.activo)),
    name: nombre || "Nombre sin especificar",
    initials: iniciales || "IN",
    email: raw.correo || "",
    dni: raw.dni == null ? "" : String(raw.dni),
    phone: raw.telefono || "",
    address: raw.direccion || "",
    status: estado,
    statusClass: estado === "Activo" ? "active" : estado === "Inactivo" ? "inactive" : "pending",
    propertyName: raw.propiedad || "Sin propiedad asignada",
    propertyAddress: raw.propiedadUbicacion || "",
    contractId: raw.idContrato ?? null,
    contractStatus: raw.estadoContrato || "",
    contractStartDate: raw.fechaInicio || null,
    contractEndDate: raw.fechaFin || null,
    idUsuario: raw.idUsuario,
    usuario: raw.usuario,
    fotoPerfil: (files.imagenes || raw.imagenes || []).map((image) => ({
      id: image.id, src: assetUrl(image.url), alt: `Foto de ${nombre}`,
    })),
  };
}

export function tenantPayload(form) {
  return {
    nombre: String(form.firstName ?? "").trim(),
    apellido: String(form.lastName ?? "").trim(),
    dni: String(form.dni ?? "").trim() || null,
    correo: String(form.email ?? "").trim() || null,
    telefono: String(form.phone ?? "").trim() || null,
    direccion: String(form.address ?? "").trim() || null,
    activo: Boolean(form.active),
  };
}

export async function getTenant(id) {
  const [raw, files] = await Promise.all([tenant(id), tenantFiles(id)]);
  return toTenant(raw, files);
}

export async function persistTenant(form, existing) {
  const body = tenantPayload(form);
  if (existing) {
    const raw = await updateTenant(existing.id, body);
    if (!raw) throw new Error("El inquilino ya no existe o no está disponible.");
    return { tenant: toTenant(raw), activationUrl: null };
  }

  const datos = { ...body };
  delete datos.activo;
  const raw = await createTenant({
    ...datos,
    usuario: String(form.email ?? "").trim().toLowerCase(),
    // La cuenta queda pendiente hasta que el inquilino use el enlace de activación.
    password: temporaryPassword(),
  });
  return { tenant: toTenant(raw), activationUrl: raw.activacion?.enlace || null };
}

function temporaryPassword() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
