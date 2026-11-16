import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isCancel } from "axios";
import { ADMIN_PAGE_SIZE, getAdminTopics } from "../../api/admin";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminPagination from "../../components/AdminPagination";
import type { AdminTopic } from "../../types";
import "./AdminPage.css";

interface TopicsResult {
  page: number | null; // which page this data belongs to
  topics: AdminTopic[];
  total: number;
  errors: string[];
}

export default function AdminTopics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [result, setResult] = useState<TopicsResult>({
    page: null,
    topics: [],
    total: 0,
    errors: [],
  });

  // Still loading until the data we have is for the page in the URL
  const loading = result.page !== page;
  const totalPages = Math.max(1, Math.ceil(result.total / ADMIN_PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();

    getAdminTopics(page, controller.signal)
      .then((data) =>
        setResult({
          page,
          topics: data.results,
          total: data.count,
          errors: [],
        }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({
          page,
          topics: [],
          total: 0,
          errors: getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [page]);

  function goToPage(next: number) {
    setSearchParams(next === 1 ? {} : { page: String(next) });
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Topics</h1>
        <p className="muted">Add, rename and remove topics.</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {result.topics.map((topic, index) => (
                      <tr key={topic.id}>
                        <td className="admin-serial">
                          {(page - 1) * ADMIN_PAGE_SIZE + index + 1}
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
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  );
}
