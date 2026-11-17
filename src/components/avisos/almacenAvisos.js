
let avisos = [];
let siguienteId = 1;
const oyentes = new Set();
export const TIPOS_AVISO = Object.freeze(["exito", "advertencia", "error", "info", "recordatorio"]);

function avisar() {
  oyentes.forEach((oyente) => oyente());
}



export function mostrarAviso({ tipo = "exito", titulo, mensaje, accion } = {}) {
  const id = siguienteId++;
  const tipoValido = TIPOS_AVISO.includes(tipo) ? tipo : "info";
  avisos = [...avisos, { id, tipo: tipoValido, titulo, mensaje, accion }];
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
