import { request } from "../utils/request.js";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("agi-session"));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem("agi-session", JSON.stringify(session));
  window.dispatchEvent(new Event("session-updated"));
}

export function clearSession() {
  localStorage.removeItem("agi-session");
  window.dispatchEvent(new Event("session-updated"));
}

export const login = (usuario, password) =>
  request("/auth/login", {
    method: "POST",
    body: { usuario, password },
    auth: false,
  }).then(({ data }) => data);

export const register = (body) =>
  request("/auth/registro", { method: "POST", body, auth: false }).then(({ data }) => data);

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}
