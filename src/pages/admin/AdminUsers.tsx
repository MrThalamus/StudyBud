import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getAdminUsers } from "../../api/admin";
import { usePageParams } from "../../hooks/usePageParams";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/AdminPagination";
import type { AdminUser } from "../../types";
import "./AdminPage.css";
import { timeAgo } from "../../utils/timeAgo";

interface UsersResult {
  page: number | null; // which page this data belongs to
  pageSize: number | null; // ...and at which page size
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
  const { page, pageSize, goToPage, changePageSize } = usePageParams();

  const [result, setResult] = useState<UsersResult>({
    page: null,
    pageSize: null,
    users: [],
    total: 0,
    errors: [],
  });

  // Still loading until the data we have matches the page AND size in the URL
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    const controller = new AbortController();

    getAdminUsers(page, pageSize, controller.signal)
      .then((data) =>
        setResult({ page, pageSize, users: data.results, total: data.count, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ page, pageSize, users: [], total: 0, errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [page, pageSize]);

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
                      <th>Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.users.map((user, index) => {
                      const role = getRole(user);
                      return (
                        <tr key={user.id}>
                          <td className="admin-serial">
                            {(page - 1) * pageSize + index + 1}
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
                          <td className="admin-nowrap">
                            {user.last_login
                              ? timeAgo(user.last_login)
                              : "Never"}
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
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
            />
          )}
        </>
      )}
    </div>
  );
}
