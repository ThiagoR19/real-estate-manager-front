const clases = [
  "dashboard-avatar--violet",
  "dashboard-avatar--blue",
  "dashboard-avatar--sand",
  "dashboard-avatar--peach",
  "dashboard-avatar--silver",
];

export default function avatarClass(nombres = "", apellidos = "") {
  const texto = `${nombres ?? ""}${apellidos ?? ""}`.toLowerCase();
  let suma = 0;
  for (const letra of texto) suma += letra.charCodeAt(0);
  return clases[suma % clases.length];
}
