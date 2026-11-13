import { request } from "../utils/request.js";
import { assetUrl } from "../utils/assetUrl.js";

const CAMPOS = ["nombre", "telefono", "ubicacion", "dominio"];

// Agrega la URL completa del logo (o null si no tiene)
const conLogo = (inmobiliaria) => ({
  ...inmobiliaria,
  urlLogo: inmobiliaria.imagenLogo ? assetUrl(`/uploads/logos/${inmobiliaria.imagenLogo}`) : null,
});

// GET /inmobiliarias/mia (solo admin): datos de la inmobiliaria del usuario logueado
export const myAgency = () => request("/inmobiliarias/mia").then(({ data }) => conLogo(data));

// PUT /inmobiliarias/mia (solo admin): actualización parcial
// datos: { nombre?, telefono?, ubicacion?, dominio? } → solo se mandan los que vengan definidos
//   un texto vacío ("") borra ese dato; nombre no puede quedar vacío
// logo (opcional): File de imagen (jpeg, png o webp, hasta 2 MB)
export function updateMyAgency(datos = {}, logo) {
  const campos = Object.fromEntries(CAMPOS.filter((campo) => datos[campo] !== undefined).map((campo) => [campo, datos[campo] ?? ""]));

  let body = campos;
  if (logo) {
    body = new FormData();
    Object.entries(campos).forEach(([campo, valor]) => body.append(campo, valor));
    body.append("logo", logo);
  }

  return request("/inmobiliarias/mia", { method: "PUT", body }).then(({ data }) => conLogo(data));
}
