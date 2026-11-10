import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";

export default function Register() {
  const { user, loading, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (user) return <Navigate to="/" replace />;

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await register(
        form.name,
        form.username,
        form.email,
        form.password1,
        form.password2,
      );
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>
      {errors.map((msg) => (
        <p key={msg}>{msg}</p>
      ))}
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />
      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => update("username", e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password1}
        onChange={(e) => update("password1", e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={form.password2}
        onChange={(e) => update("password2", e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Creating account..." : "Register"}
      </button>
      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
