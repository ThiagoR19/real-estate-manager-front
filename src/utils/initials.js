// Devuelve dos iniciales en mayúsculas: la del primer nombre y la del primer apellido
// initials("Sofia Belen", "Ramirez Lopez") -> "SR"
export default function initials(nombres = "", apellidos = "") {
  const primeraLetra = (texto) => String(texto ?? "").trim().charAt(0).toLocaleUpperCase("es-AR");
  return primeraLetra(nombres) + primeraLetra(apellidos);
}
