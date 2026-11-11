import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { mediaUrl } from "../utils/mediaUrl";
import "./Navbar.css";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const q = searchParams.get("q") ?? "";

  function handleSearch(value: string) {
    const query = value ? `?q=${encodeURIComponent(value)}` : "";
    navigate(`/${query}`, { replace: location.pathname === "/" });
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">S</span>
          <span className="navbar-logo-text">StudyBud</span>
        </Link>

        <input
          type="search"
          className="input navbar-search"
          placeholder="Search rooms..."
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="navbar-user">
          {!loading &&
            (user ? (
              <>
                <Link to={`/profile/${user.id}`} className="navbar-profile">
                  <img src={mediaUrl(user.avatar)} alt="" className="avatar" />
                  <span className="navbar-username">@{user.username}</span>
                </Link>

                <button type="button" className="btn" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign up
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
