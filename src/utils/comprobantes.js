const formatos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const TIPOS_COMPROBANTE = formatos.join(",");

export function validarComprobante(archivo) {
  if (archivo.size === 0) return "El archivo está vacío.";
  if (archivo.size > 5 * 1024 * 1024) return "El comprobante puede pesar hasta 5 MB.";
  if (archivo.type ? !formatos.includes(archivo.type) : !/\.(pdf|jpe?g|png|webp)$/i.test(archivo.name)) {
    return "Elegí un archivo PDF, JPG, PNG o WebP.";
  }
  return "";
}
