import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getErrorMessages } from "../utils/getErrorMessages";
import AuthCard from "../components/AuthCard";
import PasswordField from "../components/PasswordField";
import { LockIcon } from "../components/icons";

export default function Login() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrors(getErrorMessages(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Login"
      tagline="Find your study partner"
      footer={
        <>
          Haven&apos;t signed up yet? <Link to="/register">Sign Up</Link>
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
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="e.g. saikot@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={submitting}
        >
          <LockIcon />
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthCard>
  );
}
