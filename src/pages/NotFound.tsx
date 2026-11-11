import { Link } from "react-router-dom";
import "./FormPage.css";

export default function NotFound() {
  return (
    <div className="container form-page">
      <h1>Page not found</h1>
      <p className="muted">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        Back to home
      </Link>
    </div>
  );
}
