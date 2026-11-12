import { useAuth } from "../context/useAuth";
import { mediaUrl } from "../utils/mediaUrl";
import "./Avatar.css";

interface AvatarProps {
  src: string | null;
  userId: number | null;
  size?: "md" | "lg";
  className?: string;
}

export default function Avatar({
  src,
  userId,
  size = "md",
  className = "",
}: AvatarProps) {
  const { user } = useAuth();
  const isMe = user !== null && userId === user.id;

  return (
    <span className={`avatar-wrap avatar-wrap-${size}`}>
      <img src={mediaUrl(src)} alt="" className={`avatar ${className}`} />
      {isMe && <span className="avatar-dot" aria-hidden="true" />}
    </span>
  );
}
