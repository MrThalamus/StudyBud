import { useEffect, useState } from "react";
import { isCancel } from "axios";
import {
  createAdminTopic,
  deleteAdminTopic,
  getAdminTopics,
  updateAdminTopic,
} from "../../api/admin";
import { usePageParams } from "../../hooks/usePageParams";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/admin/AdminPagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AdminFormModal from "../../components/admin/AdminFormModal";
import type { AdminTopic } from "../../types";
import "./AdminPage.css";


interface TopicsResult {
  page: number | null; // which page this data belongs to
  pageSize: number | null; // ...and at which page size
  topics: AdminTopic[];
  total: number;
  errors: string[];
}

// The open form. id null = creating a new topic; a number = editing that topic
interface TopicForm {
  id: number | null;
  name: string;
}

// Text for the delete dialog: say what happens to the topic's rooms
function deleteWarning(topic: AdminTopic): string {
  const rooms = topic.room_count;
  if (rooms === 0) {
    return `"${topic.name}" will be deleted. This cannot be undone.`;
  }
  const roomWord = rooms === 1 ? "room" : "rooms";
  return `"${topic.name}" will be deleted. Its ${rooms} ${roomWord} will show "No topic" until their hosts add one.`;
}


export default function AdminTopics() {
  const { page, pageSize, goToPage, changePageSize } = usePageParams();

  const [result, setResult] = useState<TopicsResult>({
    page: null,
    pageSize: null,
    topics: [],
    total: 0,
    errors: [],
  });

  // The topic waiting for "Delete?" confirmation (null = no dialog)
  const [pendingDelete, setPendingDelete] = useState<AdminTopic | null>(null);
  // null = form closed
  const [form, setForm] = useState<TopicForm | null>(null);
  // Add 1 to fetch the current page again (after a delete)
  const [reloadKey, setReloadKey] = useState(0);

  // Still loading until the data we have matches the page AND size in the URL
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    const controller = new AbortController();

    getAdminTopics(page, pageSize, controller.signal)
      .then((data) =>
        setResult({
          page,
          pageSize,
          topics: data.results,
          total: data.count,
          errors: [],
        }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({
          page,
          pageSize,
          topics: [],
          total: 0,
          errors: getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [page, pageSize, reloadKey]);

  // Create or rename, depending on form.id. No try/catch: if it throws, the modal shows the error
  async function saveTopic() {
    if (!form) return;
    const data = { name: form.name };

    if (form.id === null) {
      await createAdminTopic(data);
      setForm(null);

      // Newest first: the new topic is at the top of page 1
      if (page === 1) {
        setReloadKey((key) => key + 1);
      } else {
        goToPage(1);
      }
    } else {
      await updateAdminTopic(form.id, data);
      setForm(null);
      setReloadKey((key) => key + 1); // a renamed topic keeps its place, so stay on this page
    }
  }

  async function deletePendingTopic() {
    if (!pendingDelete) return;
    await deleteAdminTopic(pendingDelete.id); // no try/catch: if it throws, the dialog shows the error
    setPendingDelete(null);

    // Deleted the only row on this page? The page is gone now, so go back one
    if (result.topics.length === 1 && page > 1) {
      goToPage(page - 1);
    } else {
      setReloadKey((key) => key + 1);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header with-action">
        <div className="admin-page-title">
          <h1>Topics</h1>
          <p className="muted">Add, rename and remove topics.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setForm({ id: null, name: "" })}
        >
          + New topic
        </button>
      </header>

      {loading && <p className="muted">Loading topics...</p>}

      {result.errors.map((msg) => (
        <p key={msg} className="admin-error">
          {msg}
        </p>
      ))}

      {!loading && result.errors.length === 0 && (
        <>
          <div className="card admin-table-card">
            {result.topics.length === 0 ? (
              <p className="admin-empty">No topics yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SL</th>
                      <th>Topic</th>
                      <th className="admin-center">Rooms</th>
                      <th>Hosts</th>
                      <th className="admin-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.topics.map((topic, index) => (
                      <tr key={topic.id}>
                        <td className="admin-serial">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td>{topic.name}</td>
                        <td className="admin-center">{topic.room_count}</td>
                        <td>
                          {topic.host_names.length === 0 ? (
                            "—"
                          ) : (
                            <span
                              className="admin-clamp"
                              title={topic.host_names.join(", ")}
                            >
                              {topic.host_names
                                .map((name) => `@${name}`)
                                .join(", ")}
                            </span>
                          )}
                        </td>
                        <td className="admin-actions">
                          <div className="admin-actions-buttons">
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-primary"
                              aria-label={`Edit ${topic.name}`}
                              onClick={() =>
                                setForm({ id: topic.id, name: topic.name })
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-danger"
                              aria-label={`Delete ${topic.name}`}
                              onClick={() => setPendingDelete(topic)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
              label="topics"
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
            />
          )}
        </>
      )}
      {form && (
        <AdminFormModal
          title={form.id === null ? "New topic" : "Edit topic"}
          submitLabel={form.id === null ? "Create" : "Save"}
          busyLabel={form.id === null ? "Creating..." : "Saving..."}
          onSubmit={saveTopic}
          onCancel={() => setForm(null)}
        >
          <label className="admin-form-field">
            <span>Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={200}
              required
              autoFocus
            />
          </label>
        </AdminFormModal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete topic?"
          message={deleteWarning(pendingDelete)}
          onConfirm={deletePendingTopic}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
