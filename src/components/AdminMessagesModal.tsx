import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { isCancel } from "axios";
import { ADMIN_PAGE_SIZE, getAdminMessages } from "../api/admin";
import { getErrorMessages } from "../utils/getErrorMessages";
import { timeAgo } from "../utils/timeAgo";
import AdminPagination from "./AdminPagination";
import type { Message } from "../types";
import "./TopicsModal.css"; // shared modal styles: overlay, card, header, scrollable body
import "./AdminMessagesModal.css";


interface AdminMessagesModalProps {
  onClose: () => void;
}

interface MessagesResult {
  page: number | null; // which page this data belongs to
  pageSize: number | null; // ...and at which page size
  messages: Message[];
  total: number;
  errors: string[];
}

export default function AdminMessagesModal({
  onClose,
}: AdminMessagesModalProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE);
  const [result, setResult] = useState<MessagesResult>({
    page: null,
    pageSize: null,
    messages: [],
    total: 0,
    errors: [],
  });

  // Still loading until the data we have matches the current page AND size
  const loading = result.page !== page || result.pageSize !== pageSize;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  // Esc closes the modal; the page behind can't scroll while it's open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Load one page of messages (runs again when the page changes)
  useEffect(() => {
    const controller = new AbortController();

    getAdminMessages(page, pageSize, controller.signal)
      .then((data) =>
        setResult({
          page,
          pageSize,
          messages: data.results,
          total: data.count,
          errors: [],
        }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({
          page,
          pageSize,
          messages: [],
          total: 0,
          errors: getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [page, pageSize]);

  // A new size starts again from page 1
  function changePageSize(nextSize: number) {
    setPageSize(nextSize);
    setPage(1);
  }

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-card admin-messages-modal"
        role="dialog"
        aria-modal="true"
        aria-label="All messages"
      >
        <div className="modal-header">
          <h2 className="modal-title">All messages</h2>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && <p className="muted modal-empty">Loading messages...</p>}

          {result.errors.map((msg) => (
            <p key={msg} className="admin-error modal-empty">
              {msg}
            </p>
          ))}

          {!loading &&
            result.errors.length === 0 &&
            (result.messages.length === 0 ? (
              <p className="muted modal-empty">No messages yet.</p>
            ) : (
              <ul className="admin-message-list">
                {result.messages.map((message) => (
                  <li key={message.id} className="admin-message">
                    <p className="admin-message-meta">
                      <strong>@{message.user_name ?? "deleted user"}</strong>
                      <span className="muted">
                        {" "}
                        in {message.room_name} · {timeAgo(message.created)}
                      </span>
                    </p>
                    <p className="admin-message-body">{message.body}</p>
                  </li>
                ))}
              </ul>
            ))}
        </div>

        {/* Only when there is more than one page */}
        {result.total > ADMIN_PAGE_SIZE && (
          <div className="admin-messages-footer">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={result.total}
              label="messages"
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={changePageSize}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
