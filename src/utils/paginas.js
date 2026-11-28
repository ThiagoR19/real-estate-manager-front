export function queryDe(parametros = {}) {
  const query = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") query.set(clave, valor);
  });
  return query.toString();
}
