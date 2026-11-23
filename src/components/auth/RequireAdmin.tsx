import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import NotFound from "../../pages/NotFound";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="container muted">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_superuser) return <NotFound />;

  return children;
}
