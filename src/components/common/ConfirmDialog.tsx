import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { getErrorMessages } from "../../utils/getErrorMessages";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string; // text on the red button
  busyLabel?: string; // text while the action runs
  onConfirm: () => Promise<void>; // throw to show an error in the dialog
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busyLabel = "Deleting...",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Esc closes the dialog; the page behind can't scroll while it's open
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

  async function handleConfirm() {
    setBusy(true);
    setErrors([]);
    try {
      await onConfirm(); // on success the parent closes the dialog
    } catch (err) {
      setErrors(getErrorMessages(err));
      setBusy(false);
    }
  }

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !busy) onCancel();
  }

  return createPortal(
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>
        <p id="confirm-message" className="confirm-message">
          {message}
        </p>

        {errors.map((msg) => (
          <p key={msg} className="confirm-error">
            {msg}
          </p>
        ))}

        <div className="confirm-actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={busy}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn confirm-danger"
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
