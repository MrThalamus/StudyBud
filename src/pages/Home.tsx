import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isCancel } from "axios";
import { useAuth } from "../context/useAuth";
import { getRooms } from "../api/rooms";
import { getTopics } from "../api/topics";
import { getErrorMessages } from "../utils/getErrorMessages";
import type { Room, Topic } from "../types";

interface RoomsResult {
  query: string | null;
  rooms: Room[];
  errors: string[];
}

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();

  const [q, setQ] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [result, setResult] = useState<RoomsResult>({
    query: null,
    rooms: [],
    errors: [],
  });

  const roomsLoading = result.query !== q;

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getRooms(q, controller.signal)
      .then((rooms) => setResult({ query: q, rooms, errors: [] }))
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ query: q, rooms: [], errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [q]);

  if (authLoading) return <p>Loading...</p>;

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

      <hr />
      <input
        type="search"
        placeholder="Search rooms..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <h2>Browse topics</h2>
      <ul>
        <li>
          <button type="button" onClick={() => setQ("")} disabled={q === ""}>
            All
          </button>
        </li>
        {topics.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              onClick={() => setQ(topic.name)}
              disabled={q === topic.name}
            >
              {topic.name}
            </button>
          </li>
        ))}
      </ul>

      <hr />
      {roomsLoading && <p>Loading rooms...</p>}
      {result.errors.map((msg) => (
        <p key={msg}>{msg}</p>
      ))}
      {!roomsLoading && result.errors.length === 0 && (
        <p>
          {result.rooms.length === 0
            ? "No rooms found. Try another search."
            : `${result.rooms.length} rooms found`}
        </p>
      )}

      <ul>
        {result.rooms.map((room) => (
          <li key={room.id}>
            <h3>
              <Link to={`/room/${room.id}`}>{room.name}</Link>
            </h3>
            <p>
              Hosted by {room.host_name ?? "Unknown"} ·{" "}
              {room.topic_name ?? "No topic"}
            </p>
            <p>
              {room.participants.length} joined · created{" "}
              {new Date(room.created).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
