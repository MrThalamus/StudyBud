import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ADMIN_LINKS } from "./AdminLinks";
import { ChevronDownIcon, ShieldIcon } from "./icons";
import "./UserMenu.css";
import "./AdminMenu.css";

// Remember open/closed in the browser, so it survives page changes and refresh
const STORAGE_KEY = "admin-menu-open";

function readOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function AdminMenu() {
  const [open, setOpen] = useState(readOpen);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage blocked (e.g. some private windows): menu still works, just won't remember
    }
  }

  return (
    <div className="admin-menu">
      <button
        type="button"
        className="admin-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <ShieldIcon />
        <span className="admin-menu-label">Admin management</span>
        <span className={`user-menu-chevron ${open ? "is-open" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              role="menuitem"
              className={({ isActive }) =>
                `user-menu-item ${isActive ? "is-active" : ""}`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
