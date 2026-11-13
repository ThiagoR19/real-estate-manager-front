import { request } from "../utils/request.js";

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem("agi-session"));
  } catch {
    return null;
  }
}

export function guardarSesion(session) {
  localStorage.setItem("agi-session", JSON.stringify(session));
  window.dispatchEvent(new Event("session-updated"));
}

export function limpiarSesion() {
  localStorage.removeItem("agi-session");
  window.dispatchEvent(new Event("session-updated"));
}

export const login = (usuario, password) =>
  request("/auth/login", {
    method: "POST",
    body: { usuario, password },
    auth: false,
  }).then(({ data }) => data);

export const registrar = (body) =>
  request("/auth/registro", { method: "POST", body, auth: false }).then(({ data }) => data);

export const verificarDniInvitacion = (codigo, dni) =>
  request(`/auth/invitacion/${encodeURIComponent(codigo)}/verificar`, {
    method: "POST", body: { dni }, auth: false,
  }).then(({ data }) => data);

export async function cerrarSesion() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    limpiarSesion();
  }
}
