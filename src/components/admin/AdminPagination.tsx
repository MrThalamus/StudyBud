import { ADMIN_PAGE_SIZES } from "../../api/admin";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  label: string; // e.g. "rooms", "topics"
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// Only the sizes that change something: once one size already shows
// every row, bigger sizes would look exactly the same.
// (The current size always stays in the list, so the dropdown can show it.)
function usefulPageSizes(total: number, current: number) {
  return ADMIN_PAGE_SIZES.filter(
    (size, index) =>
      index === 0 || ADMIN_PAGE_SIZES[index - 1] < total || size === current,
  );
}

// Rows per page + Previous / "Page X of Y" / Next, shared by every admin table
export default function AdminPagination({
  page,
  totalPages,
  total,
  label,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const sizes = usefulPageSizes(total, pageSize);

  return (
    <nav className="admin-pagination">
      {/* No point choosing a size when there's only one option */}
      {sizes.length > 1 && (
        <label className="admin-page-size">
          Rows per page
          <select
            className="admin-page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="admin-pagination-controls">
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
      </div>
    </nav>
  );
}
