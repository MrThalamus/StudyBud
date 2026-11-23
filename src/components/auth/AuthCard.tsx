import type { ReactNode } from "react";
import "./AuthCard.css";

interface AuthCardProps {
  title: string;
  tagline: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthCard({
  title,
  tagline,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <header className="auth-header">{title}</header>
        <div className="auth-body">
          <p className="auth-tagline">{tagline}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </div>
    </div>
  );
}
