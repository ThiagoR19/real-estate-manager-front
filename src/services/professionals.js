import initials from "../utils/initials.js";
import { apiBase, request } from "../utils/request.js";

export function assetUrl(path) {
  if (!path) return null;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).href;
}

export async function professionals() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/profesionales?page=${page}&limit=100`);
    items.push(...(Array.isArray(result.data) ? result.data : []));
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const professional = (id) => request(`/profesionales/${id}`).then(({ data }) => data);
export const createProfessional = (body) => request("/profesionales", { method: "POST", body }).then(({ data }) => data);
export const updateProfessional = (id, body) => request(`/profesionales/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const deleteProfessional = (id) => request(`/profesionales/${id}`, { method: "DELETE" });


export function toProfessional(raw) {
  const nombre = [raw.nombre, raw.apellido].filter(Boolean).join(" ").trim();

  const iniciales = initials(nombre)

  return {
    id: raw.id,
    idInmobiliaria: raw.idInmobiliaria,
    idPersona: raw.idPersona,
    name: nombre || "Nombre sin especificar",
    initials: iniciales || "IN",
    email: raw.correo || "",
    phone: raw.telefono || "",
    address: raw.direccion || "",
  };
}

export function professionalPayload(form) {
  return {
    nombre: String(form.firstName ?? "").trim(),
    apellido: String(form.lastName ?? "").trim(),
    correo: String(form.email ?? "").trim() || null,
    telefono: String(form.phone ?? "").trim() || null,
    profesion: String(form.profesion ?? "").trim() || null,
  };
}

export async function getProfessional(id) {
  const [raw] = await new Promise([professional(id)]);
  return toProfessional(raw);
}

export async function persistProfessional(form, existing) {
  const body = professionalPayload(form);
  if (existing) {
    const raw = await updateProfessional(existing.id, body);
    if (!raw) throw new Error("El profesional ya no existe o no está disponible.");
    return { professional: toProfessional(raw) };
  }
  const datos = { ...body };
  const raw = await createProfessional({
    ...datos,
  });
  return { professional: toProfessional(raw) };
}
