import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="container muted">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
