import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isCancel } from "axios";
import { getAllMessages, deleteMessage } from "../api/messages";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import type { Message } from "../types";
import "./ActivityFeed.css";

const MAX_ITEMS = 5;

export default function ActivityFeed() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getAllMessages(controller.signal)
      .then(setMessages)
      .catch((err) => {
        if (isCancel(err)) return;
        setErrors(getErrorMessages(err));
      });

    return () => controller.abort();
  }, []);

  const recent = messages?.slice(0, MAX_ITEMS) ?? [];
  async function handleDelete(messageId: number) {
    if (!window.confirm("Delete this message?")) return;

    setErrors([]);
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev && prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setErrors(getErrorMessages(err));
    }
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
      {messages !== null && recent.length === 0 && (
        <p className="muted">No activity yet.</p>
      )}

      <div className="activity-list">
        {recent.map((message) => (
          <article key={message.id} className="card activity-item">
            <div className="activity-meta">
              <Avatar src={message.user_avatar} userId={message.user} />
              <div>
                <Link to={`/profile/${message.user}`}>
                  @{message.user_name}
                </Link>
                <p className="muted">{timeAgo(message.created)}</p>
              </div>
            </div>

            <p className="muted">
              replied to{" "}
              <Link to={`/room/${message.room}`}>{message.room_name}</Link>
            </p>
            <p className="activity-body">{message.body}</p>

            {user?.id === message.user && (
              <button
                type="button"
                className="activity-delete"
                aria-label="Delete message"
                onClick={() => handleDelete(message.id)}
              >
                ✕
              </button>
            )}
          </article>
        ))}
      </div>
    </aside>
  );
}
