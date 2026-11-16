import { request } from "../utils/request.js";
import { assetUrl } from "../utils/assetUrl.js";

const CAMPOS = ["nombre", "telefono", "ubicacion", "dominio"];


const conLogo = (inmobiliaria) => ({
  ...inmobiliaria,
  urlLogo: inmobiliaria.imagenLogo ? assetUrl(`/uploads/logos/${inmobiliaria.imagenLogo}`) : null,
});


export const miInmobiliaria = () => request("/inmobiliarias/mia").then(({ data }) => conLogo(data));





export function actualizarMiInmobiliaria(datos = {}, logo) {
  const campos = Object.fromEntries(CAMPOS.filter((campo) => datos[campo] !== undefined).map((campo) => [campo, datos[campo] ?? ""]));

  let body = campos;
  if (logo) {
    body = new FormData();
    Object.entries(campos).forEach(([campo, valor]) => body.append(campo, valor));
    body.append("logo", logo);
  }

  return request("/inmobiliarias/mia", { method: "PUT", body }).then(({ data }) => conLogo(data));
}
