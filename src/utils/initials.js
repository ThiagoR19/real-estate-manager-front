export default function initials(nombres = "", apellidos = "") {
  const primeraLetra = (texto) =>
    String(texto ?? "")
      .trim()
      .charAt(0)
      .toLocaleUpperCase("es-AR");
  return primeraLetra(nombres) + primeraLetra(apellidos);
}
