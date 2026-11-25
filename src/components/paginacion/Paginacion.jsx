import { PAGE_SIZE } from "./usePaginacion.js";
import "./Paginacion.css";

export default function Paginacion({ page, totalPages, total, onPageChange, pageSize = PAGE_SIZE, mostrarTamanoPagina = false }) {
  if (!total) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  return (
    <nav className="paginacion" aria-label="Paginación">
      <span className="paginacion__count">
        Mostrando {first} - {last} de {total}
        {mostrarTamanoPagina && ` · ${pageSize} por página`}
      </span>
      <div className="paginacion__buttons">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </button>
        {Array.from({ length: end - start + 1 }, (_, index) => start + index).map((number) => (
          <button
            type="button"
            key={number}
            className={number === page ? "is-active" : ""}
            aria-label={`Página ${number}`}
            aria-current={number === page ? "page" : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente
        </button>
      </div>
    </nav>
  );
}
