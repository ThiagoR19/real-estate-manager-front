const clases = [
  "dashboard-avatar--violet",
  "dashboard-avatar--blue",
  "dashboard-avatar--sand",
  "dashboard-avatar--peach",
  "dashboard-avatar--silver",
];

// Devuelve siempre la misma clase de avatar para el mismo nombre y apellido
// Suma los códigos de las letras y usa el resto de dividir por la cantidad de clases
export default function avatarClass(nombres = "", apellidos = "") {
  const texto = `${nombres ?? ""}${apellidos ?? ""}`.toLowerCase();
  let suma = 0;
  for (const letra of texto) suma += letra.charCodeAt(0);
  return clases[suma % clases.length];
}
