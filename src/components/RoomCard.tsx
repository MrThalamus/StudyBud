import { Link } from "react-router-dom";
import type { Room } from "../types";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import "./RoomCard.css";

// To catch mistakes, we can define the props type for the component. This is a good practice in TypeScript to ensure that the component receives the correct props and helps with autocompletion and type checking in your IDE.

// It describes the shape of the props this component expects, and it exists only to catch mistakes before you run the app
interface RoomCardProps {
  room: Room;
  onTopicClick: (name: string) => void;
}

export default function RoomCard({ room, onTopicClick }: RoomCardProps) {
  return (
    <article className="card room-card">
      <header className="room-card-header">
        {room.host ? (
          <Link to={`/profile/${room.host}`} className="room-card-host">
            <Avatar src={room.host_avatar} userId={room.host} />
            <span>@{room.host_name}</span>
          </Link>
        ) : (
          <span className="room-card-host muted">Unknown host</span>
        )}
        <span className="muted">{timeAgo(room.created)}</span>
      </header>

      <h3 className="room-card-title">
        <Link to={`/room/${room.id}`}>{room.name}</Link>
      </h3>

      {room.description && (
        <p className="room-card-description">{room.description}</p>
      )}

      <footer className="room-card-footer">
        <span className="muted">{room.participants.length} joined</span>
        {room.topic_name && (
          <button
            type="button"
            className="tag room-card-tag"
            onClick={() => onTopicClick(room.topic_name!)}
          >
            {room.topic_name}
          </button>
        )}
      </footer>
    </article>
  );
}
