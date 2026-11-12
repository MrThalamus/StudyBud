import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isCancel, isAxiosError } from "axios";
import { getRoom, getRoomParticipants, deleteRoom } from "../api/rooms";
import { getRoomMessages, deleteMessage } from "../api/messages";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";
import Avatar from "../components/Avatar";
import { timeAgo } from "../utils/timeAgo";
import MessageForm from "../components/MessageForm";
import type { Message, Room, User } from "../types";
import "./RoomDetail.css";



interface RoomResult {
  id: number;
  room: Room | null;
  messages: Message[];
  participants: User[]; 
  errors: string[];
}

export default function RoomDetail() {
  const { id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const [roomErrors, setRoomErrors] = useState<string[]>([]);
    const [deletingRoom, setDeletingRoom] = useState(false);
  const { user } = useAuth();
  const [result, setResult] = useState<RoomResult | null>(null);
    const [deleteErrors, setDeleteErrors] = useState<string[]>([]);


  useEffect(() => {
    const controller = new AbortController();

        Promise.all([
          getRoom(roomId, controller.signal),
          getRoomMessages(roomId, controller.signal),
          getRoomParticipants(roomId, controller.signal),
        ])
          .then(([room, messages, participants]) =>
            setResult({ id: roomId, room, messages, participants, errors: [] }),
          )

          .catch((err) => {
            if (isCancel(err)) return;
            const notFound = isAxiosError(err) && err.response?.status === 404;
            setResult({
              id: roomId,
              room: null,
              messages: [],
              participants: [],
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
    const { room, messages, participants } = result;


      function handlePosted(message: Message) {
        setResult((prev) => {
          if (!prev) return prev;
          const joined =
            !user || prev.participants.some((p) => p.id === user.id)
              ? prev.participants
              : [...prev.participants, user];
          return {
            ...prev,
            messages: [message, ...prev.messages],
            participants: joined,
          };
        });
      }

      async function handleDelete(messageId: number) {
        if (!window.confirm("Delete this message?")) return;

        setDeleteErrors([]);
        try {
          await deleteMessage(messageId);
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.filter((m) => m.id !== messageId),
                }
              : prev,
          );
        } catch (err) {
          setDeleteErrors(getErrorMessages(err));
        }
      }

        async function handleDeleteRoom() {
          if (
            !window.confirm(
              "Delete this room and all of its messages? This cannot be undone.",
            )
          )
            return;

          setRoomErrors([]);
          setDeletingRoom(true);
          try {
            await deleteRoom(room.id);
            navigate("/");
          } catch (err) {
            setRoomErrors(getErrorMessages(err));
            setDeletingRoom(false);
          }
        }

  return (
    <div className="container room-detail">
      <Link to="/" className="muted">
        ← Back to rooms
      </Link>
      <section className="card room-detail-header">
        <div className="room-detail-title">
          <h1>{room.name}</h1>
          {user?.id === room.host && (
            <div className="room-detail-actions">
              <Link
                to={`/room/${room.id}/edit`}
                className="btn room-detail-edit"
              >
                Edit room
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteRoom}
                disabled={deletingRoom}
              >
                {deletingRoom ? "Deleting..." : "Delete room"}
              </button>
            </div>
          )}
        </div>

        {roomErrors.map((msg) => (
          <p key={msg} className="room-detail-error">
            {msg}
          </p>
        ))}

        <p className="muted">
          Hosted by{" "}
          {room.host ? (
            <Link to={`/profile/${room.host}`}>@{room.host_name}</Link>
          ) : (
            "Unknown"
          )}{" "}
          · {room.topic_name ?? "No topic"} · created {timeAgo(room.created)}
        </p>
      </section>{" "}
      {room.description && <p>{room.description}</p>}
      <div className="room-detail-columns">
        <section className="card">
          <h2 className="section-title">Conversation</h2>
          <MessageForm roomId={room.id} onPosted={handlePosted} />

          {deleteErrors.map((msg) => (
            <p key={msg} className="room-detail-error">
              {msg}
            </p>
          ))}

          {messages.length === 0 && (
            <p className="muted">No messages yet. Be the first to reply.</p>
          )}

          <div className="room-detail-messages">
            {messages.map((message) => (
              <article key={message.id} className="room-detail-message">
                <Avatar src={message.user_avatar} userId={message.user} />
                <div>
                  <p>
                    <Link to={`/profile/${message.user}`}>
                      @{message.user_name}
                    </Link>{" "}
                    <span className="muted">{timeAgo(message.created)}</span>
                  </p>
                  <p className="room-detail-body">{message.body}</p>
                </div>
                {user?.id === message.user && (
                  <button
                    type="button"
                    className="room-detail-delete"
                    onClick={() => handleDelete(message.id)}
                  >
                    Delete
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="card room-detail-participants">
          <h2 className="section-title">
            Participants ({participants.length})
          </h2>
          {participants.length === 0 && (
            <p className="muted">Nobody has joined yet.</p>
          )}
          <ul className="room-detail-participant-list">
            {participants.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/profile/${p.id}`}
                  className="room-detail-participant"
                >
                  <Avatar src={p.avatar} userId={p.id} />
                  <span>
                    {p.name || p.username}
                    <span className="muted"> @{p.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
