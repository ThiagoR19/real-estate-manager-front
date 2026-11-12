import { PAGE_SIZE } from "./usePagination.js";
import "./Pagination.css";

export default function Pagination({ page, totalPages, total, onPageChange, pageSize = PAGE_SIZE }) {
  if (!total) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  return (
    <nav className="pagination" aria-label="Paginación">
      <span className="pagination__count">Mostrando {first}–{last} de {total}</span>
      <div className="pagination__buttons">
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
