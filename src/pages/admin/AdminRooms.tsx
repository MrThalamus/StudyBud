import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getAdminRooms } from "../../api/admin";
import { usePageParams } from "../../hooks/usePageParams";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/admin/AdminPagination";
import type { AdminRoom } from "../../types";
import "./AdminPage.css";

interface RoomsResult {
  page: number | null; // which page this data belongs to
  pageSize: number | null; // ...and at which page size
  rooms: AdminRoom[];
  total: number;
  errors: string[];
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

  // Still loading until the data we have matches the page AND size in the URL
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    const controller = new AbortController();

    getAdminRooms(page, pageSize, controller.signal)
      .then((data) =>
        setResult({ page, pageSize, rooms: data.results, total: data.count, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ page, pageSize, rooms: [], total: 0, errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [page, pageSize]);

  return (
    <div className="admin-page">
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
                          {(page - 1) * pageSize + index + 1}
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
    </div>
  );
}
