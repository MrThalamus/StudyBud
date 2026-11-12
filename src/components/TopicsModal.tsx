import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { Topic } from "../types";
import "./TopicsModal.css";

interface TopicsModalProps {
  topics: Topic[];
  active: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function TopicsModal({
  topics,
  active,
  onSelect,
  onClose,
}: TopicsModalProps) {
  const [search, setSearch] = useState("");

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

  const term = search.trim().toLowerCase();
  const filtered = [...topics]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((topic) => topic.name.toLowerCase().includes(term));

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="All topics"
      >
        <div className="modal-header">
          <h2 className="modal-title">All topics ({topics.length})</h2>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-search">
          <input
            type="search"
            className="input"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {filtered.length === 0 && (
            <p className="muted modal-empty">No topics found.</p>
          )}
          <ul className="modal-topic-list">
            {filtered.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  className={`topics-item ${active === topic.name ? "is-active" : ""}`}
                  onClick={() => onSelect(topic.name)}
                >
                  <span>{topic.name}</span>
                  <span className="topics-count">{topic.room_count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
