import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isCancel } from "axios";
import { getAllMessages, deleteMessage } from "../../api/messages";
import { useAuth } from "../../context/useAuth";
import { getErrorMessages } from "../../utils/getErrorMessages";
import Avatar from "../common/Avatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { timeAgo } from "../../utils/timeAgo";
import type { Message } from "../../types";
import "./ActivityFeed.css";

const MAX_ITEMS = 5;

export default function ActivityFeed() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
      getAllMessages(MAX_ITEMS, controller.signal)
        .then((data) => setMessages(data.results))

      .catch((err) => {
        if (isCancel(err)) return;
        setErrors(getErrorMessages(err));
      });

    return () => controller.abort();
  }, []);

  // Runs when "Delete" is clicked in the dialog.
  // No try/catch here: if it fails, the dialog catches the error and shows it.
  async function deletePendingMessage() {
    if (pendingDeleteId === null) return;
    await deleteMessage(pendingDeleteId);
    setMessages((prev) => prev && prev.filter((m) => m.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }

  return (
    <aside className="activity">
      <h2 className="section-title">Recent activity</h2>

      {messages === null && errors.length === 0 && (
        <p className="muted">Loading activity...</p>
      )}
      {errors.map((msg) => (
        <p key={msg} className="muted">
          {msg}
        </p>
      ))}
      {messages !== null && messages.length === 0 && (
        <p className="muted">No activity yet.</p>
      )}

      <div className="activity-list">
        {(messages ?? []).map((message) => (
          <article key={message.id} className="card activity-item">
            <div className="activity-meta">
              <Avatar src={message.user_avatar} userId={message.user} />
              <div className="activity-meta-text">
                <p>
                  <Link to={`/profile/${message.user}`}>
                    @{message.user_name}
                  </Link>
                  <span className="muted"> replied to </span>
                  <Link to={`/room/${message.room}`}>{message.room_name}</Link>
                </p>
                <p className="muted">{timeAgo(message.created)}</p>
              </div>
            </div>

            <p className="activity-body">{message.body}</p>

            {user?.id === message.user && (
              <button
                type="button"
                className="activity-delete"
                aria-label="Delete message"
                onClick={() => setPendingDeleteId(message.id)}
              >
                ✕
              </button>
            )}
          </article>
        ))}
      </div>

      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="Delete message?"
          message="This message will be removed from the room. This cannot be undone."
          onConfirm={deletePendingMessage}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </aside>
  );
}
