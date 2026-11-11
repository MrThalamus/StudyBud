import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { updateProfile } from "../api/users";
import { getErrorMessages } from "../utils/getErrorMessages";
import { mediaUrl } from "../utils/mediaUrl";
import "./FormPage.css";
import "./EditProfile.css";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!user) return null;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const data = new FormData();
    data.append("name", name.trim());
    data.append("username", username.trim());
    data.append("email", email.trim());
    data.append("bio", bio.trim());
    if (file) data.append("avatar", file);

    try {
      const updated = await updateProfile(data);
      updateUser(updated);
      navigate(`/profile/${updated.id}`);
    } catch (err) {
      setErrors(getErrorMessages(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="container form-page">
      <Link to={`/profile/${user.id}`} className="muted">
        ← Back to profile
      </Link>
      <h1>Edit profile</h1>

      <form className="card room-form" onSubmit={handleSubmit}>
        {errors.map((msg) => (
          <p key={msg} className="room-form-error">
            {msg}
          </p>
        ))}

        <div className="edit-profile-avatar">
          <img
            src={preview ?? mediaUrl(user.avatar)}
            alt=""
            className="avatar edit-profile-avatar-img"
          />
          <label className="btn">
            Change photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>

        <label className="room-form-field">
          <span>Name</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
          />
        </label>

        <label className="room-form-field">
          <span>Username</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="room-form-field">
          <span>Email</span>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="room-form-field">
          <span>Bio</span>
          <textarea
            className="input"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
