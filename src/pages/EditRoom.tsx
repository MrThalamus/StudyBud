import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isCancel, isAxiosError } from "axios";
import { getRoom, updateRoom } from "../api/rooms";
import { getTopics } from "../api/topics";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";
import RoomForm from "../components/RoomForm";
import type { Room, RoomFormValues, Topic } from "../types";
import "./FormPage.css";

interface EditResult {
  id: number;
  room: Room | null;
  topics: Topic[];
  errors: string[];
}

export default function EditRoom() {
  const { id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState<EditResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getRoom(roomId, controller.signal),
      getTopics(undefined, controller.signal),
    ])
      .then(([room, topics]) =>
        setResult({ id: roomId, room, topics, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        const notFound = isAxiosError(err) && err.response?.status === 404;
        setResult({
          id: roomId,
          room: null,
          topics: [],
          errors: notFound ? ["Room not found."] : getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [roomId]);

  if (result === null || result.id !== roomId) {
    return <p className="container muted form-page">Loading room...</p>;
  }

  if (result.room === null) {
    return (
      <div className="container form-page">
        {result.errors.map((msg) => (
          <p key={msg}>{msg}</p>
        ))}
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const { room, topics } = result;

  if (user?.id !== room.host) {
    return (
      <div className="container form-page">
        <p>Only the host can edit this room.</p>
        <Link to={`/room/${room.id}`}>Back to room</Link>
      </div>
    );
  }

  async function handleSubmit(values: RoomFormValues) {
    await updateRoom(room.id, values);
    navigate(`/room/${room.id}`);
  }

  return (
    <div className="container form-page">
      <Link to={`/room/${room.id}`} className="muted">
        ← Back to room
      </Link>
      <h1>Edit room</h1>

      <RoomForm
        topics={topics}
        initial={{
          name: room.name,
          topic_name: room.topic_name ?? "",
          description: room.description ?? "",
        }}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
