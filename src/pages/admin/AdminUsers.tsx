import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from "../../api/admin";
import { usePageParams } from "../../hooks/usePageParams";
import { useAuth } from "../../context/useAuth";
import { setTokens } from "../../api/token";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/admin/AdminPagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AdminFormModal from "../../components/admin/AdminFormModal";
import ImportUsersModal from "../../components/admin/ImportUsersModal";
import PasswordField from "../../components/auth/PasswordField";
import { UploadIcon } from "../../components/common/icons";
import type { AdminUser, AdminUserInput } from "../../types";
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
// The open form. id null = creating; a number = editing that user
interface UserForm {
  id: number | null;
  name: string;
  username: string;
  email: string;
  password: string; // "" on edit = keep the current password
  bio: string;
  isAdmin: boolean; // one checkbox for both is_superuser and is_staff
  isActive: boolean;
}

const EMPTY_FORM: UserForm = {
  id: null,
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  isAdmin: false,
  isActive: true,
};

// Text for the delete dialog: messages go with the user (CASCADE),
// their rooms stay but lose their host (SET_NULL)
function deleteWarning(user: AdminUser): string {
  return `@${user.username} and all their messages will be deleted. Rooms they host will have no host. This cannot be undone.(To keep their data, deactivate them instead.)`;
}

export default function AdminUsers() {
  const { page, pageSize, goToPage, changePageSize } = usePageParams();
  // The logged-in admin: they can't delete their own account (backend says 403)
  const { user: currentUser, updateUser } = useAuth();

  const [result, setResult] = useState<UsersResult>({
    page: null,
    pageSize: null,
    users: [],
    total: 0,
    errors: [],
  });
  // The user waiting for "Delete?" confirmation (null = no dialog)
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  // null = form closed
  const [form, setForm] = useState<UserForm | null>(null);
  // Add 1 to fetch the current page again (after a delete)
  const [reloadKey, setReloadKey] = useState(0);
 
  const [importOpen, setImportOpen] = useState(false);
  // Still loading until the data we have matches the page AND size in the URL
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    const controller = new AbortController();

    getAdminUsers(page, pageSize, controller.signal)
      .then((data) =>
        setResult({
          page,
          pageSize,
          users: data.results,
          total: data.count,
          errors: [],
        }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({
          page,
          pageSize,
          users: [],
          total: 0,
          errors: getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [page, pageSize, reloadKey]);

  // Fill the form from the row. Password stays empty: blank = keep the current one
  function openEditForm(user: AdminUser) {
    setForm({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      bio: user.bio ?? "",
      isAdmin: user.is_superuser || user.is_staff,
      isActive: user.is_active,
    });
  }

  // Change one field. <K extends keyof UserForm> lets one function set text AND checkboxes:
  // setField("name", "Ali") and setField("isAdmin", true) are both checked by TypeScript
  function setField<K extends keyof UserForm>(field: K, value: UserForm[K]) {
    setForm((current) => current && { ...current, [field]: value });
  }

  // No try/catch: if it throws, the modal shows the error
  async function saveUser() {
    if (!form) return;
    const data: AdminUserInput = {
      name: form.name,
      username: form.username,
      email: form.email,
      bio: form.bio,
      is_superuser: form.isAdmin, // one Admin checkbox sets both flags
      is_staff: form.isAdmin,
      is_active: form.isActive,
    };
    if (form.password) data.password = form.password; // only send it if typed
    if (form.id === null) {
      await createAdminUser(data);
      setForm(null);

      // The backend lists newest users first, so the new one is on page 1
      if (page === 1) {
        setReloadKey((key) => key + 1);
      } else {
        goToPage(1);
      }
      return;
    }

    const saved = await updateAdminUser(form.id, data);

    if (saved.id === currentUser?.id) {
      // Changing your own password logs out all your sessions on the server,
      // and it sends a fresh pair back. Save it, or the next request fails.
      if (saved.access && saved.refresh) setTokens(saved.access, saved.refresh);
      updateUser(saved); // navbar shows your new name/username right away
    }

    setForm(null);
    setReloadKey((key) => key + 1); // an edited user keeps their place, so stay on this page
  }
  // New users are listed first: reload page 1, or go there
  function showNewestUsers() {
    if (page === 1) {
      setReloadKey((key) => key + 1);
    } else {
      goToPage(1);
    }
  }
  async function deletePendingUser() {
    if (!pendingDelete) return;
    await deleteAdminUser(pendingDelete.id); // no try/catch: if it throws, the dialog shows the error
    setPendingDelete(null);

    // Deleted the only row on this page? The page is gone now, so go back one
    if (result.users.length === 1 && page > 1) {
      goToPage(page - 1);
    } else {
      setReloadKey((key) => key + 1);
    }
  }
  return (
    <div className="admin-page">
      <header className="admin-page-header with-action">
        <div className="admin-page-title">
          <h1>Users</h1>
          <p className="muted">Manage accounts and admin access.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setImportOpen(true)}
          >
            <UploadIcon />
            Import Users
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setForm(EMPTY_FORM)}
          >
            + New user
          </button>
        </div>
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
                      <th className="admin-actions">Actions</th>
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
                          <td className="admin-actions">
                            <div className="admin-actions-buttons">
                              <button
                                type="button"
                                className="btn btn-sm btn-soft-primary"
                                aria-label={`Edit ${user.username}`}
                                onClick={() => openEditForm(user)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-soft-danger"
                                aria-label={`Delete ${user.username}`}
                                onClick={() => setPendingDelete(user)}
                                disabled={user.id === currentUser?.id}
                                title={
                                  user.id === currentUser?.id
                                    ? "You can't delete your own account"
                                    : undefined
                                }
                              >
                                Delete
                              </button>
                            </div>
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
      {form && (
        <AdminFormModal
          title={form.id === null ? "New user" : "Edit user"}
          submitLabel={form.id === null ? "Create" : "Save"}
          busyLabel={form.id === null ? "Creating..." : "Saving..."}
          onSubmit={saveUser}
          onCancel={() => setForm(null)}
        >
          <label className="admin-form-field">
            <span>Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              maxLength={200}
              required
              autoFocus
            />
          </label>

          <label className="admin-form-field">
            <span>Username</span>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              maxLength={150}
              autoComplete="off"
              required
            />
          </label>

          <label className="admin-form-field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <PasswordField
            label={
              form.id === null
                ? "Password"
                : "New password (leave blank to keep the current one)"
            }
            value={form.password}
            onChange={(value) => setField("password", value)}
            autoComplete="new-password"
            required={form.id === null}
          />

          <label className="admin-form-field">
            <span>Bio (optional)</span>
            <textarea
              className="input"
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              rows={3}
            />
          </label>

          <label className="admin-form-check">
            <input
              type="checkbox"
              checked={form.isAdmin}
              disabled={form.id === currentUser?.id}
              onChange={(e) => setField("isAdmin", e.target.checked)}
            />
            Admin
            <span className="admin-form-hint">
              (can open this panel; can't host rooms)
            </span>
          </label>

          <label className="admin-form-check">
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={form.id === currentUser?.id}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
            Active
            <span className="admin-form-hint">(unticked = can't log in)</span>
          </label>
          {form.id === currentUser?.id && (
            <p className="admin-form-hint">
              You can't remove your own admin access or deactivate yourself.
            </p>
          )}
        </AdminFormModal>
      )}
      {importOpen && (
        <ImportUsersModal
          onImported={showNewestUsers}
          onClose={() => setImportOpen(false)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete user?"
          message={deleteWarning(pendingDelete)}
          onConfirm={deletePendingUser}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
