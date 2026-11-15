import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isCancel } from "axios";
import { ADMIN_PAGE_SIZE, getAdminRooms } from "../../api/admin";
import { getErrorMessages } from "../../utils/getErrorMessages";
import type { AdminRoom } from "../../types";
import "./AdminPage.css";

interface RoomsResult {
  page: number | null; // which page this data belongs to
  rooms: AdminRoom[];
  total: number;
  errors: string[];
}

export default function AdminRooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [result, setResult] = useState<RoomsResult>({
    page: null,
    rooms: [],
    total: 0,
    errors: [],
  });

  // Still loading until the data we have is for the page in the URL
  const loading = result.page !== page;
  const totalPages = Math.max(1, Math.ceil(result.total / ADMIN_PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();

    getAdminRooms(page, controller.signal)
      .then((data) =>
        setResult({ page, rooms: data.results, total: data.count, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ page, rooms: [], total: 0, errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [page]);

  function goToPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) });
  }

  return (
    <div className="container admin-page">
      <header className="admin-page-header">
        <h1>Rooms</h1>
        <p className="muted">Create, edit and delete study rooms.</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {result.rooms.map((room, index) => (
                      <tr key={room.id}>
                        <td className="admin-serial">
                          {(page - 1) * ADMIN_PAGE_SIZE + index + 1}
                        </td>
                        <td>{room.name}</td>
                        <td>{room.topic_name ?? "—"}</td>
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
                        <td className="admin-center">{room.message_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {result.total > 0 && (
            <nav className="admin-pagination">
              <button
                type="button"
                className="btn"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="muted">
                Page {page} of {totalPages} · {result.total} rooms
              </span>
              <button
                type="button"
                className="btn"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
