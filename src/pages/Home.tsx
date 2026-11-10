import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isCancel } from "axios";
import { getRooms } from "../api/rooms";
import { getTopics } from "../api/topics";
import { getErrorMessages } from "../utils/getErrorMessages";
import TopicsSidebar from "../components/TopicsSidebar";
import type { Room, Topic } from "../types";

interface RoomsResult {
  query: string | null;
  rooms: Room[];
  errors: string[];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") ?? "";

    function setQ(value: string) {
      setSearchParams(value ? { q: value } : {});
    }


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

    return (
        <div className="container layout">
          <TopicsSidebar topics={topics} active={q} onSelect={setQ} />

          <main>
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
          </main>

          <aside>
            <h2 className="section-title">Recent activity</h2>
            <p className="muted">Coming soon</p>
          </aside>
        </div>
      );

}
