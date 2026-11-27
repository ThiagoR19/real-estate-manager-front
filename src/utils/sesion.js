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
