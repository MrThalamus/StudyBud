import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import UserMenu from "./UserMenu";
import "./Navbar.css";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">S</span>
          <span className="navbar-logo-text">StudyBud</span>
        </Link>

        <div className="navbar-user">
          {!loading &&
            (user ? (
              <UserMenu />
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
