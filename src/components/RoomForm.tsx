import { useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessages } from "../utils/getErrorMessages";
import type { RoomFormValues, Topic } from "../types";
import "./RoomForm.css";

interface RoomFormProps {
  topics: Topic[];
  initial?: RoomFormValues;
  submitLabel: string;
  onSubmit: (values: RoomFormValues) => Promise<void>;
}

export default function RoomForm({
  topics,
  initial,
  submitLabel,
  onSubmit,
}: RoomFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
    const [topic, setTopic] = useState(initial?.topic_name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        topic_name: topic.trim(),
        description: description.trim(),
      });

    } catch (err) {
      setErrors(getErrorMessages(err));
      setSubmitting(false);
    }
  }

  return (
    <form className="card room-form" onSubmit={handleSubmit}>
      {errors.map((msg) => (
        <p key={msg} className="room-form-error">
          {msg}
        </p>
      ))}

      <label className="room-form-field">
        <span>Room name</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          required
        />
      </label>

      <label className="room-form-field">
        <span>Topic</span>
                <input
          className="input"
          list="room-form-topics"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Pick a topic or type a new one"
          maxLength={200}
          required
        />
        <datalist id="room-form-topics">
          {topics.map((t) => (
            <option key={t.id} value={t.name} />
          ))}
        </datalist>
      </label>

      <label className="room-form-field">
        <span>Description</span>
        <textarea
          className="input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
