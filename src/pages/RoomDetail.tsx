import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isCancel, isAxiosError } from "axios";
import { getRoom } from "../api/rooms";
import { getRoomMessages } from "../api/messages";
import { getErrorMessages } from "../utils/getErrorMessages";
import { mediaUrl } from "../utils/mediaUrl";
import { timeAgo } from "../utils/timeAgo";
import type { Message, Room } from "../types";
import "./RoomDetail.css";

interface RoomResult {
  id: number;
  room: Room | null;
  messages: Message[];
  errors: string[];
}

export default function RoomDetail() {
  const { id } = useParams();
  const roomId = Number(id);

  const [result, setResult] = useState<RoomResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getRoom(roomId, controller.signal),
      getRoomMessages(roomId, controller.signal),
    ])
      .then(([room, messages]) =>
        setResult({ id: roomId, room, messages, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        const notFound = isAxiosError(err) && err.response?.status === 404;
        setResult({
          id: roomId,
          room: null,
          messages: [],
          errors: notFound ? ["Room not found."] : getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [roomId]);

  if (result === null || result.id !== roomId) {
    return (
      <p className="container muted room-detail-status">Loading room...</p>
    );
  }

  if (result.room === null) {
    return (
      <div className="container room-detail-status">
        {result.errors.map((msg) => (
          <p key={msg}>{msg}</p>
        ))}
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const { room, messages } = result;

  return (
    <div className="container room-detail">
      <Link to="/" className="muted">
        ← Back to rooms
      </Link>

      <section className="card room-detail-header">
        <h1>{room.name}</h1>
        <p className="muted">
          Hosted by {room.host_name ?? "Unknown"} ·{" "}
          {room.topic_name ?? "No topic"} · created {timeAgo(room.created)}
        </p>
        {room.description && <p>{room.description}</p>}
      </section>

      <section className="card">
        <h2 className="section-title">Conversation</h2>

        {messages.length === 0 && (
          <p className="muted">No messages yet. Be the first to reply.</p>
        )}

        <div className="room-detail-messages">
          {messages.map((message) => (
            <article key={message.id} className="room-detail-message">
              <img
                src={mediaUrl(message.user_avatar)}
                alt=""
                className="avatar"
              />
              <div>
                <p>
                  <Link to={`/profile/${message.user}`}>
                    @{message.user_name}
                  </Link>{" "}
                  <span className="muted">{timeAgo(message.created)}</span>
                </p>
                <p className="room-detail-body">{message.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
