import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isCancel } from "axios";
import { getRooms } from "../api/rooms";
import { getTopics } from "../api/topics";
import { getErrorMessages } from "../utils/getErrorMessages";
import TopicsSidebar from "../components/topics/TopicsSidebar";
import RoomCard from "../components/rooms/RoomCard";
import SearchBar from "../components/common/SearchBar";
import ActivityFeed from "../components/rooms/ActivityFeed";
import AdminMenu from "../components/admin/AdminMenu";
import { useAuth } from "../context/useAuth";
import type { Room, Topic } from "../types";

interface RoomsResult {
  q: string | null; // the search these rooms belong to
  topic: string | null; // the topic these rooms belong to
  rooms: Room[];
  errors: string[];
}


export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const topic = searchParams.get("topic") ?? "";

  // Change one value in the URL (?q= or ?topic=) and keep the other one
  function updateParam(key: "q" | "topic", value: string, replace = false) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace });
  }
  // Picking a topic starts a fresh search inside that topic
  function selectTopic(name: string) {
    setSearchParams(name ? { topic: name } : {});
  }

  const [topics, setTopics] = useState<Topic[]>([]);
  const [result, setResult] = useState<RoomsResult>({
    q: null,
    topic: null,
    rooms: [],
    errors: [],
  });

  const roomsLoading = result.q !== q || result.topic !== topic;

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getRooms({ q, topic }, controller.signal)
      .then((rooms) => setResult({ q, topic, rooms, errors: [] }))
      .catch((err) => {
        if (isCancel(err)) return;
        setResult({ q, topic, rooms: [], errors: getErrorMessages(err) });
      });

    return () => controller.abort();
  }, [q, topic]);

  return (
    <div className="container layout">
      <div className="home-sidebar">
        {user?.is_superuser && <AdminMenu />}
        <TopicsSidebar
          topics={topics}
          active={topic}
          onSelect={selectTopic}
        />
      </div>

      <main>
        <h2 className="section-title">Study Room</h2>
        <SearchBar
          value={q}
          onChange={(value) => updateParam("q", value, true)}
        />
        <Link to="/create-room" className="btn btn-primary">
          + Create room
        </Link>

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

        <div className="room-feed">
          {result.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onTopicClick={selectTopic}
            />
          ))}
        </div>
      </main>

      <aside className="home-activity">
        <ActivityFeed />
      </aside>
    </div>
  );
}
