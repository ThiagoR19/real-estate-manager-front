// Lista global de toasts: cualquier parte de la app puede llamar a mostrarToast()
let toasts = [];
let siguienteId = 1;
const oyentes = new Set();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

// tipo: "exito" | "advertencia" | "error" | "info" | "recordatorio"
// accion (opcional): { texto, href } para un link o { texto, onClick } para un botón
export function mostrarToast({ tipo = "exito", titulo, mensaje, accion } = {}) {
  const id = siguienteId++;
  toasts = [...toasts, { id, tipo, titulo, mensaje, accion }];
  avisar();
  return id;
}

export function quitarToast(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  avisar();
}

export function suscribirToasts(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function leerToasts() {
  return toasts;
}
