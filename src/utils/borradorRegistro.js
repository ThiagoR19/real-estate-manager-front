const key = "agi-registro-verificado";

export const guardarBorradorRegistro = (value) => sessionStorage.setItem(key, JSON.stringify(value));
export const obtenerBorradorRegistro = () => {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
};
export const limpiarBorradorRegistro = () => sessionStorage.removeItem(key);
