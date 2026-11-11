import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { createMessage } from "../api/messages";
import { getErrorMessages } from "../utils/getErrorMessages";
import type { Message } from "../types";
import "./MessageForm.css";

interface MessageFormProps {
  roomId: number;
  onPosted: (message: Message) => void;
}

export default function MessageForm({ roomId, onPosted }: MessageFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="muted">
        <Link to="/login">Log in</Link> to join the conversation.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    setErrors([]);
    setSubmitting(true);
    try {
      const message = await createMessage(roomId, text);
      onPosted(message);
      setBody("");
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      {errors.map((msg) => (
        <p key={msg} className="message-form-error">
          {msg}
        </p>
      ))}
      <textarea
        className="input"
        rows={3}
        placeholder="Write your message here..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting || body.trim() === ""}
      >
        {submitting ? "Posting..." : "Post message"}
      </button>
    </form>
  );
}
