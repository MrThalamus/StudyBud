interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  label: string; // e.g. "rooms", "topics"
  onPageChange: (page: number) => void;
}

// Previous / "Page X of Y" / Next, shared by every admin table
export default function AdminPagination({
  page,
  totalPages,
  total,
  label,
  onPageChange,
}: AdminPaginationProps) {
  return (
    <nav className="admin-pagination">
      <button
        type="button"
        className="btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      <span className="muted">
        Page {page} of {totalPages} · {total} {label}
      </span>
      <button
        type="button"
        className="btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
