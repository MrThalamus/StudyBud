import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";
import AuthCard from "../components/AuthCard";
import PasswordField from "../components/PasswordField";
import { UserIcon } from "../components/icons";

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
    <AuthCard
      title="Register"
      tagline="Create your StudyBud account"
      footer={
        <>
          Already registered? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <div className="auth-error" role="alert">
            {errors.map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="register-name">Name</label>
          <input
            required
            id="register-name"
            className="input"
            placeholder="e.g. saikot"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            className="input"
            placeholder="e.g. saikot"
            autoComplete="username"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            className="input"
            type="email"
            placeholder="e.g. saikot@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>

        <PasswordField
          label="Password"
          value={form.password1}
          onChange={(value) => update("password1", value)}
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirm password"
          value={form.password2}
          onChange={(value) => update("password2", value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={submitting}
        >
          <UserIcon />
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}
