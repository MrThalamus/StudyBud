import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Avatar from "./Avatar";
import { ChevronDownIcon, LogoutIcon, WrenchIcon } from "./icons";
import "./UserMenu.css";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // The menu remembers which page it was opened on,
  // so it closes by itself when you navigate somewhere else.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === location.pathname;

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenPath(null);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPath(null);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  function close() {
    setOpenPath(null);
  }

  function toggle() {
    setOpenPath(open ? null : location.pathname);
  }

  async function handleLogout() {
    close();
    await logout();
    navigate("/");
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Avatar src={user.avatar} userId={user.id} />

        <span className="user-menu-names">
          <span className="user-menu-name">{user.name || user.username}</span>
          <span className="user-menu-username">@{user.username}</span>
        </span>
        <span className={`user-menu-chevron ${open ? "is-open" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          <Link
            to="/settings"
            role="menuitem"
            className="user-menu-item"
            onClick={close}
          >
            <WrenchIcon />
            Settings
          </Link>
          <div className="user-menu-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="user-menu-item"
            onClick={handleLogout}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
