import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isAxiosError, isCancel } from "axios";
import { getUser, getUserMessages, getUserRooms } from "../api/users";
import { getErrorMessages } from "../utils/getErrorMessages";
import { mediaUrl } from "../utils/mediaUrl";
import { timeAgo } from "../utils/timeAgo";
import RoomCard from "../components/RoomCard";
import type { Message, Room, User } from "../types";
import "./Profile.css";
import { useAuth } from "../context/useAuth";


const MAX_MESSAGES = 10;

interface ProfileResult {
  id: number;
  user: User | null;
  rooms: Room[];
  messages: Message[];
  errors: string[];
}

export default function Profile() {
  const { id } = useParams();
  const profileId = Number(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();


  const [result, setResult] = useState<ProfileResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getUser(profileId, controller.signal),
      getUserRooms(profileId, controller.signal),
      getUserMessages(profileId, controller.signal),
    ])
      .then(([user, rooms, messages]) =>
        setResult({ id: profileId, user, rooms, messages, errors: [] }),
      )
      .catch((err) => {
        if (isCancel(err)) return;
        const notFound = isAxiosError(err) && err.response?.status === 404;
        setResult({
          id: profileId,
          user: null,
          rooms: [],
          messages: [],
          errors: notFound ? ["User not found."] : getErrorMessages(err),
        });
      });

    return () => controller.abort();
  }, [profileId]);

  if (result === null || result.id !== profileId) {
    return <p className="container muted profile-status">Loading profile...</p>;
  }

  if (result.user === null) {
    return (
      <div className="container profile-status">
        {result.errors.map((msg) => (
          <p key={msg}>{msg}</p>
        ))}
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const { user, rooms, messages } = result;

  function goToTopic(name: string) {
    navigate(`/?q=${encodeURIComponent(name)}`);
  }

    return (
      <>
        <div className="container profile-back">
          <Link to="/" className="muted">
            ← Back to rooms
          </Link>
        </div>

        <div className="container layout">
          <aside className="card profile-card">
            <img
              src={mediaUrl(user.avatar)}
              alt=""
              className="avatar profile-avatar"
            />
            <h1>{user.name ?? user.username}</h1>
            <p className="muted">@{user.username}</p>
            <p className="profile-bio">{user.bio ?? "No bio yet."}</p>
            {currentUser?.id === user.id && (
              <Link to="/settings" className="btn">
                Edit profile
              </Link>
            )}
          </aside>

          <main>
            <h2 className="section-title">Rooms hosted ({rooms.length})</h2>
            {rooms.length === 0 && (
              <p className="muted">This user hasn't hosted any rooms yet.</p>
            )}
            <div className="room-feed">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onTopicClick={goToTopic} />
              ))}
            </div>
          </main>

          <aside>
            <h2 className="section-title">Recent messages</h2>
            {messages.length === 0 && <p className="muted">No messages yet.</p>}
            <div className="profile-messages">
              {messages.slice(0, MAX_MESSAGES).map((message) => (
                <article key={message.id} className="card profile-message">
                  <p className="muted">
                    replied to{" "}
                    <Link to={`/room/${message.room}`}>
                      {message.room_name}
                    </Link>{" "}
                    · {timeAgo(message.created)}
                  </p>
                  <p className="profile-message-body">{message.body}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </>
    );

}
