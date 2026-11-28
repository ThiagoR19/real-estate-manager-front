import Paginacion from "./Paginacion.jsx";

export default function PaginacionServidor({ paginacion, alCambiar }) {
  if (!paginacion) return null;
  if (!paginacion.total) return <p role="status">Total: 0</p>;
  return <Paginacion page={paginacion.pagina} totalPages={paginacion.paginas} total={paginacion.total}
    pageSize={paginacion.limite} onPageChange={alCambiar} />;
}
