// Lista global de avisos: cualquier parte de la app puede llamar a mostrarAviso()
let avisos = [];
let siguienteId = 1;
const oyentes = new Set();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

// tipo: "exito" | "advertencia" | "error" | "info" | "recordatorio"
// accion (opcional): { texto, href } para un link o { texto, onClick } para un botón
export function mostrarAviso({ tipo = "exito", titulo, mensaje, accion } = {}) {
  const id = siguienteId++;
  avisos = [...avisos, { id, tipo, titulo, mensaje, accion }];
  avisar();
  return id;
}

export function quitarAviso(id) {
  avisos = avisos.filter((aviso) => aviso.id !== id);
  avisar();
}

export function suscribirAvisos(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function leerAvisos() {
  return avisos;
}
