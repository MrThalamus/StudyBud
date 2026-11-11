import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isCancel } from "axios";
import { createRoom } from "../api/rooms";
import { getTopics } from "../api/topics";
import { getErrorMessages } from "../utils/getErrorMessages";
import RoomForm from "../components/RoomForm";
import type { RoomFormValues, Topic } from "../types";
import "./FormPage.css";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getTopics(undefined, controller.signal)
      .then(setTopics)
      .catch((err) => {
        if (isCancel(err)) return;
        setErrors(getErrorMessages(err));
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit(values: RoomFormValues) {
    const room = await createRoom(values);
    navigate(`/room/${room.id}`);
  }

  return (
    <div className="container form-page">
      <Link to="/" className="muted">
        ← Back to rooms
      </Link>
      <h1>Create room</h1>

      {errors.map((msg) => (
        <p key={msg}>{msg}</p>
      ))}
      {topics === null && errors.length === 0 && (
        <p className="muted">Loading topics...</p>
      )}
      {topics !== null && (
        <RoomForm
          topics={topics}
          submitLabel="Create room"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
