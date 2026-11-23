import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getAdminStats } from "../../api/admin";
import { getErrorMessages } from "../../utils/getErrorMessages";
import AdminMessagesModal from "../../components/AdminMessagesModal";
import type { AdminStats } from "../../types";
import "./AdminPage.css";


// What one card on the dashboard shows
interface StatCard {
  label: string;
  value: number;
  hint?: string; // small grey line under the number
  to?: string; // admin page to open on click (none = not clickable)
  onClick?: () => void; // opens something on click (e.g. a modal) instead of a page
}

// Turns the numbers from the server into a list of cards
function buildCards(stats: AdminStats, onMessagesClick: () => void): StatCard[] {
  const adminWord = stats.admins === 1 ? "admin" : "admins";
  return [
    {
      label: "Users",
      value: stats.users,
      hint: `${stats.active_users} active · ${stats.admins} ${adminWord}`,
      to: "/admin/users",
    },
    { label: "Rooms", value: stats.rooms, to: "/admin/rooms" },
    { label: "Topics", value: stats.topics, to: "/admin/topics" },
    { label: "Messages", value: stats.messages, onClick: onMessagesClick },
  ];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMessages, setShowMessages] = useState(false);

  // No numbers and no errors yet = still waiting for the server
  const loading = stats === null && errors.length === 0;

  useEffect(() => {
    const controller = new AbortController();

    getAdminStats(controller.signal)
      .then(setStats)
      .catch((err) => {
        if (isCancel(err)) return;
        setErrors(getErrorMessages(err));
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Dashboard</h1>
        <p className="muted">An overview of everything on StudyBud.</p>
      </header>

      {loading && <p className="muted">Loading stats...</p>}

      {errors.map((msg) => (
        <p key={msg} className="admin-error">
          {msg}
        </p>
      ))}

      {stats && (
        <div className="admin-stats">
          {buildCards(stats, () => setShowMessages(true)).map((card) => {
            const content = (
              <>
                <span className="admin-stat-label">{card.label}</span>
                <span className="admin-stat-value">
                  {card.value.toLocaleString()}
                </span>
                {card.hint && (
                  <span className="admin-stat-hint">{card.hint}</span>
                )}
              </>
            );

            if (card.to) {
              return (
                <Link key={card.label} to={card.to} className="card admin-stat admin-stat-link">
                  {content}
                </Link>
              );
            }
            if (card.onClick) {
              return (
                <button
                  key={card.label}
                  type="button"
                  className="card admin-stat admin-stat-button"
                  onClick={card.onClick}
                >
                  {content}
                </button>
              );
            }
            return (
              <div key={card.label} className="card admin-stat">
                {content}
              </div>
            );
          })}
        </div>
      )}

      {showMessages && (
        <AdminMessagesModal onClose={() => setShowMessages(false)} />
      )}
  </div>
  );
}
