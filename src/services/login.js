import { request } from "../utils/request.js";

export function getSession() {
  try { return JSON.parse(localStorage.getItem("agi-session")); }
  catch { return null; }
}

export function saveSession(session) {
  localStorage.setItem("agi-session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("agi-session");
}

export const login = (usuario, password) => request("/auth/login", {
  method: "POST",
  body: { usuario, password },
  auth: false,
}).then(({ data }) => data);

export async function logout() {
  await request("/auth/logout", { method: "POST" });
  clearSession();
}
