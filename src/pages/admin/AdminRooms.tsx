import { useEffect, useState } from "react";
import { isCancel } from "axios";
import {
  createAdminRoom,
  deleteAdminRoom,
  getAdminRooms,
  getAdminUsers,
  updateAdminRoom,
} from "../../api/admin";
import { getTopics } from "../../api/topics";
import { usePageParams } from "../../hooks/usePageParams";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/admin/AdminPagination";
import NoTopicBadge from "../../components/topics/NoTopicBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AdminFormModal from "../../components/admin/AdminFormModal";
import type { AdminRoom, AdminRoomInput, AdminUser, Topic } from "../../types";
import AdminMessagesModal from "../../components/admin/AdminMessagesModal";
import { MessageIcon } from "../../components/common/icons";

interface RoomsResult {
  page: number | null; // which page this data belongs to
  pageSize: number | null; // ...and at which page size
  rooms: AdminRoom[];
  total: number;
  errors: string[];
}

// The open form. id null = creating; a number = editing that room.
// topic and host are the <select> values: "" = nothing chosen yet, else the id as text
interface RoomForm {
  id: number | null;
  name: string;
  description: string;
  topic: string;
  host: string;
}

// Choices for the two dropdowns, loaded when the form opens
interface FormOptions {
  topics: Topic[];
  hosts: AdminUser[];
  errors: string[];
}

// Same rule as the backend's validate_host: active and not an admin
function canHost(user: AdminUser) {
  return user.is_active && !user.is_superuser && !user.is_staff;
}
// Badge text: 7 -> "7", 150 -> "99+" (keeps the bubble small)
function badgeText(count: number): string {
  return count > 99 ? "99+" : String(count);
}
// Text for the delete dialog: a room's messages are deleted with it (CASCADE)
function deleteWarning(room: AdminRoom): string {
  const count = room.message_count;
  if (count === 0) {
    return `"${room.name}" will be deleted. This cannot be undone.`;
  }
  const messageWord = count === 1 ? "message" : "messages";
  return `"${room.name}" and its ${count} ${messageWord} will be deleted. This cannot be undone.`;
}

export default function AdminRooms() {
  const { page, pageSize, goToPage, changePageSize } = usePageParams();

  const [result, setResult] = useState<RoomsResult>({
    page: null,
    pageSize: null,
    rooms: [],
    total: 0,
    errors: [],
  });
  // The room waiting for "Delete?" confirmation (null = no dialog)
  const [pendingDelete, setPendingDelete] = useState<AdminRoom | null>(null);

  // null = form closed
  const [form, setForm] = useState<RoomForm | null>(null);

  // null = dropdown choices still loading
  const [options, setOptions] = useState<FormOptions | null>(null);
  // The room whose messages are open in the modal (null = closed)
  const [messagesRoom, setMessagesRoom] = useState<AdminRoom | null>(null);
  // Add 1 to fetch the current page again (after a delete)
  const [reloadKey, setReloadKey] = useState(0);

  // Still loading until the data we have matches the page AND size in the URL
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    const controller = new AbortController();

    getAdminRooms(page, pageSize, controller.signal)
      .then((data) =>
        setResult({
          page,
          pageSize,
          rooms: data.results,
          total: data.count,
          errors: [],
        }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({
          page,
          pageSize,
          rooms: [],
          total: 0,
          errors: getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [page, pageSize, reloadKey]);

  // Topics (all of them) and possible hosts (first 100 users), sorted A-Z
  async function loadFormOptions() {
    setOptions(null);
    try {
      const [topics, users] = await Promise.all([
        getTopics(),
        getAdminUsers(1, 100),
      ]);
      const hosts = users.results
        .filter(canHost)
        .sort((a, b) => a.username.localeCompare(b.username));

      setOptions({
        topics: [...topics].sort((a, b) => a.name.localeCompare(b.name)),
        hosts,
        errors: [],
      });

      // Editing a room whose host can't host (an admin, or deactivated)?
      // Clear the host so the form asks for a new one
      setForm((current) =>
        current &&
        current.host !== "" &&
        !hosts.some((user) => String(user.id) === current.host)
          ? { ...current, host: "" }
          : current,
      );
    } catch (err) {
      setOptions({ topics: [], hosts: [], errors: getErrorMessages(err) });
    }
  }

  function openCreateForm() {
    setForm({ id: null, name: "", description: "", topic: "", host: "" });
    void loadFormOptions(); // void = start it, don't wait for it
  }

  // Fill the form from the row. Select values are text: 3 -> "3", null -> ""
  function openEditForm(room: AdminRoom) {
    setForm({
      id: room.id,
      name: room.name,
      description: room.description ?? "",
      topic: room.topic === null ? "" : String(room.topic),
      host: room.host === null ? "" : String(room.host),
    });
    void loadFormOptions();
  }

  // Change one field of the open form
  function setField(
    field: "name" | "description" | "topic" | "host",
    value: string,
  ) {
    setForm((current) => current && { ...current, [field]: value });
  }

  // No try/catch: if it throws, the modal shows the error
  async function saveRoom() {
    if (!form) return;
    const data: AdminRoomInput = {
      name: form.name,
      description: form.description,
      topic: Number(form.topic), // "3" -> 3
      host: Number(form.host),
    };

    if (form.id === null) {
      await createAdminRoom(data);
      setForm(null);

      // Newest first: the new room is at the top of page 1
      if (page === 1) {
        setReloadKey((key) => key + 1);
      } else {
        goToPage(1);
      }
    } else {
      await updateAdminRoom(form.id, data);
      setForm(null);
      setReloadKey((key) => key + 1); // an edited room keeps its place, so stay on this page
    }
  }

  async function deletePendingRoom() {
    if (!pendingDelete) return;
    await deleteAdminRoom(pendingDelete.id); // no try/catch: if it throws, the dialog shows the error
    setPendingDelete(null);

    // Deleted the only row on this page? The page is gone now, so go back one
    if (result.rooms.length === 1 && page > 1) {
      goToPage(page - 1);
    } else {
      setReloadKey((key) => key + 1);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header with-action">
        <div className="admin-page-title">
          <h1>Rooms</h1>
          <p className="muted">Create, edit and delete study rooms.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          + New room
        </button>
      </header>

      {loading && <p className="muted">Loading rooms...</p>}

      {result.errors.map((msg) => (
        <p key={msg} className="admin-error">
          {msg}
        </p>
      ))}

      {!loading && result.errors.length === 0 && (
        <>
          <div className="card admin-table-card">
            {result.rooms.length === 0 ? (
              <p className="admin-empty">No rooms yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SL</th>
                      <th>Room</th>
                      <th>Topic</th>
                      <th>Host</th>
                      <th className="admin-center">Participants</th>
                      <th>Participant names</th>
                      <th className="admin-center">Messages</th>
                      <th className="admin-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rooms.map((room, index) => (
                      <tr key={room.id}>
                        <td className="admin-serial">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td>{room.name}</td>
                        <td>{room.topic_name ?? <NoTopicBadge />}</td>
                        <td>{room.host_name ?? "—"} </td>
                        <td className="admin-center">
                          {room.participants.length}
                        </td>
                        <td>
                          {room.participant_names.length === 0 ? (
                            "—"
                          ) : (
                            <span
                              className="admin-clamp"
                              title={room.participant_names.join(", ")}
                            >
                              {room.participant_names
                                .map((name) => `@${name}`)
                                .join(", ")}
                            </span>
                          )}
                        </td>
                        <td className="admin-center">
                          <button
                            type="button"
                            className="admin-msg-button"
                            onClick={() => setMessagesRoom(room)}
                            aria-label={`Show ${room.message_count} messages in ${room.name}`}
                            title="Show messages"
                          >
                            <MessageIcon />
                            <span
                              className={`admin-msg-badge ${room.message_count === 0 ? "is-zero" : ""}`}
                            >
                              {badgeText(room.message_count)}
                            </span>
                          </button>
                        </td>
                        <td className="admin-actions">
                          <div className="admin-actions-buttons">
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-primary"
                              aria-label={`Edit ${room.name}`}
                              onClick={() => openEditForm(room)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-danger"
                              aria-label={`Delete ${room.name}`}
                              onClick={() => setPendingDelete(room)}
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
              label="rooms"
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
            />
          )}
        </>
      )}
      {form && (
        <AdminFormModal
          title={form.id === null ? "New room" : "Edit room"}
          submitLabel={form.id === null ? "Create" : "Save"}
          busyLabel={form.id === null ? "Creating..." : "Saving..."}
          onSubmit={saveRoom}
          onCancel={() => setForm(null)}
        >
          {options?.errors.map((msg) => (
            <p key={msg} className="admin-form-error">
              {msg}
            </p>
          ))}

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
            <span>Topic</span>
            <select
              className="input"
              value={form.topic}
              onChange={(e) => setField("topic", e.target.value)}
              disabled={!options}
              required
            >
              <option value="">
                {options ? "Choose a topic..." : "Loading..."}
              </option>
              {options?.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form-field">
            <span>Host</span>
            <select
              className="input"
              value={form.host}
              onChange={(e) => setField("host", e.target.value)}
              disabled={!options}
              required
            >
              <option value="">
                {options ? "Choose a host..." : "Loading..."}
              </option>
              {options?.hosts.map((user) => (
                <option key={user.id} value={user.id}>
                  @{user.username} ({user.name})
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form-field">
            <span>Description (optional)</span>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
            />
          </label>
        </AdminFormModal>
      )}
      {messagesRoom && (
        <AdminMessagesModal
          roomId={messagesRoom.id}
          title={`Messages in ${messagesRoom.name}`}
          onClose={() => setMessagesRoom(null)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete room?"
          message={deleteWarning(pendingDelete)}
          onConfirm={deletePendingRoom}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
