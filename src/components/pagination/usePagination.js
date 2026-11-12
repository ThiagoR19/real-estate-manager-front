import { useState } from "react";

export const PAGE_SIZE = 10;
export const PROPERTY_PAGE_SIZE = 12;

export function usePagination(items, pageSize = PAGE_SIZE) {
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    totalPages,
    pageItems: items.slice((page - 1) * pageSize, page * pageSize),
    setPage,
    resetPage: () => setPage(1),
  };
}
