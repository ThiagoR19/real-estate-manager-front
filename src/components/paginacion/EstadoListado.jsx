export default function EstadoListado({ cargando, error, alReintentar, vacio, mensajeVacio = "No se encontraron resultados." }) {
  if (cargando) return <p role="status">Cargando...</p>;
  if (error) return <p role="alert">{error} <button type="button" onClick={alReintentar}>Reintentar</button></p>;
  if (vacio) return <p role="status">{mensajeVacio}</p>;
  return null;
}
