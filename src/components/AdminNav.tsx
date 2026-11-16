import { Link, NavLink } from "react-router-dom";
import { ADMIN_LINKS } from "./AdminLinks";
import { ShieldIcon } from "./icons";
import "./AdminNav.css";

// Always-open admin menu shown on every /admin page
export default function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin">
      <div className="admin-nav-title">
        <ShieldIcon />
        Admin management
      </div>

      {ADMIN_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "is-active" : ""}`
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}

      <Link to="/" className="admin-nav-back">
        ← Back to site
      </Link>
    </nav>
  );
}
