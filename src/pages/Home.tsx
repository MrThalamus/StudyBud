import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>StudyBud</h1>
      {user ? (
        <>
          <p>Logged in as {user.username}</p>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <Link to="/login">Log in</Link>
      )}
    </div>
  );
}
