import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isCancel } from "axios";
import { ADMIN_PAGE_SIZE, getAdminUsers } from "../../api/admin";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/AdminPagination";
import type { AdminUser } from "../../types";
import "./AdminPage.css";

interface UsersResult {
  page: number | null; // which page this data belongs to
  users: AdminUser[];
  total: number;
  errors: string[];
}

// Highest role wins: a superuser is shown as Admin even if also staff
function getRole(user: AdminUser) {
  if (user.is_superuser)
    return { label: "Admin", className: "admin-badge-admin" };
  if (user.is_staff) return { label: "Staff", className: "admin-badge-staff" };
  return { label: "User", className: "admin-badge-user" };
}

// "2026-11-12T09:57:05Z" -> "12 Nov 2026"
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [result, setResult] = useState<UsersResult>({
    page: null,
    users: [],
    total: 0,
    errors: [],
  });

  // Still loading until the data we have is for the page in the URL
  const loading = result.page !== page;
  const totalPages = Math.max(1, Math.ceil(result.total / ADMIN_PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();

    getAdminUsers(page, controller.signal)
      .then((data) =>
        setResult({ page, users: data.results, total: data.count, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ page, users: [], total: 0, errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [page]);

  function goToPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) });
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Users</h1>
        <p className="muted">Manage accounts and admin access.</p>
      </header>

      {loading && <p className="muted">Loading users...</p>}

      {result.errors.map((msg) => (
        <p key={msg} className="admin-error">
          {msg}
        </p>
      ))}

      {!loading && result.errors.length === 0 && (
        <>
          <div className="card admin-table-card">
            {result.users.length === 0 ? (
              <p className="admin-empty">No users yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SL</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.users.map((user, index) => {
                      const role = getRole(user);
                      return (
                        <tr key={user.id}>
                          <td className="admin-serial">
                            {(page - 1) * ADMIN_PAGE_SIZE + index + 1}
                          </td>
                          <td>{user.name || "—"}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`admin-badge ${role.className}`}>
                              {role.label}
                            </span>
                          </td>
                          <td>
                            {user.is_active ? (
                              <span className="admin-badge admin-badge-active">
                                Active
                              </span>
                            ) : (
                              <span className="admin-badge admin-badge-inactive">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="admin-nowrap">
                            {formatDate(user.date_joined)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {result.total > 0 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={result.total}
              label="users"
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  );
}
