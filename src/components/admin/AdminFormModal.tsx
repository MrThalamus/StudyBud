import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { getErrorMessages } from "../../utils/getErrorMessages";
import "./AdminFormModal.css";

interface AdminFormModalProps {
  title: string;
  submitLabel?: string; // text on the blue button
  busyLabel?: string; // text while saving
  onSubmit: () => Promise<void>; // throw to show an error in the modal
  onCancel: () => void;
  children: ReactNode; // the input fields, written by the page
}

// A modal with a form inside: Create / Edit for topics, rooms and users
export default function AdminFormModal({
  title,
  submitLabel = "Save",
  busyLabel = "Saving...",
  onSubmit,
  onCancel,
  children,
}: AdminFormModalProps) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Esc closes the modal; the page behind can't scroll while it's open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onCancel]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser from reloading the page
    setBusy(true);
    setErrors([]);
    try {
      await onSubmit(); // on success the parent closes the modal
    } catch (err) {
      setErrors(getErrorMessages(err));
      setBusy(false);
    }
  }

  // No overlay click to close: one stray click would throw away what you typed
  return createPortal(
    <div className="admin-form-overlay">
      <form
        className="admin-form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-form-title"
        onSubmit={handleSubmit}
      >
        <h2 id="admin-form-title" className="admin-form-title">
          {title}
        </h2>

        {/* disabled = every input inside is locked while saving */}
        <fieldset className="admin-form-fields" disabled={busy}>
          {children}
        </fieldset>

        {errors.map((msg) => (
          <p key={msg} className="admin-form-error">
            {msg}
          </p>
        ))}

        <div className="admin-form-actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? busyLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
