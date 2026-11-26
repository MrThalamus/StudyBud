import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import { importAdminUsers } from "../../api/admin";
import { getErrorMessages } from "../../utils/getErrorMessages";
import type { ImportRowError, ImportUsersResult } from "../../types";
import "./AdminFormModal.css";
import "./ImportUsersModal.css";

const MAX_FILE_SIZE = 1024 * 1024; 
// Files in public/ are served from the site root (BASE_URL is "/" by default)
const SAMPLE_FILE_URL = `${import.meta.env.BASE_URL}users-import-sample.txt`;

interface ImportUsersModalProps {
  onImported: () => void; // at least one user was created: the page reloads its table
  onClose: () => void;
}

// { email: ["This email already exists"] } -> "email: This email already exists"
function describeRowErrors(errors: ImportRowError["errors"]): string {
  return Object.entries(errors)
    .map(([field, messages]) =>
      field === "detail"
        ? messages.join(" ")
        : `${field}: ${messages.join(" ")}`,
    )
    .join(" · ");
}

// Two steps in one modal: 1) pick a TXT and upload it, 2) show what was created / what failed
export default function ImportUsersModal({
  onImported,
  onClose,
}: ImportUsersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]); // whole-file problems (400 from the server)
  const [result, setResult] = useState<ImportUsersResult | null>(null); // null = still on step 1

  // Same as AdminFormModal: Esc closes, the page behind can't scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setErrors([]);

    // Check the size here too, so a big file isn't uploaded just to be refused
    if (picked && picked.size > MAX_FILE_SIZE) {
      setFile(null);
      e.target.value = ""; // empty the picker
      setErrors(["File is too large (max 1 MB)."]);
      return;
    }
    setFile(picked);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setErrors([]);
    try {
      const data = await importAdminUsers(file);
      setResult(data); // switch to step 2
      if (data.created > 0) onImported();
    } catch (err) {
      setErrors(getErrorMessages(err)); // e.g. "Missing columns: password"
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="admin-form-overlay">
      <form
        className="admin-form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-users-title"
        onSubmit={handleSubmit}
      >
        <h2 id="import-users-title" className="admin-form-title">
          Import users
        </h2>

        {result === null ? (
          <>
            <fieldset className="admin-form-fields" disabled={busy}>
              <p className="admin-form-hint">
                A .txt file with comma-separated values. Line 1 is the header:{" "}
                <strong>email,username,name,password</strong> and optionally{" "}
                <strong>,bio</strong>. One user per line, up to 500 users. Put a
                value in double quotes if it contains a comma.
              </p>

              <a href={SAMPLE_FILE_URL} download className="import-sample-link">
                Download sample file
              </a>

              <label className="admin-form-field">
                <span>Text file (.txt)</span>
                <input className="input" type="file" accept=".txt,text/plain" 
                onChange={handleFileChange} autoFocus />
              </label>
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
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || !file}
              >
                {busy ? "Importing..." : "Import"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="import-summary">
              <span className="admin-badge admin-badge-active">
                {result.created} created
              </span>
              {result.failed > 0 && (
                <span className="admin-badge admin-badge-inactive">
                  {result.failed} failed
                </span>
              )}
            </div>

            {result.errors.length > 0 && (
              <ul className="import-errors">
                {result.errors.map((rowError) => (
                  <li key={rowError.row}>
                    <strong>Row {rowError.row}</strong>
                    {rowError.email && ` (${rowError.email})`}:{" "}
                    {describeRowErrors(rowError.errors)}
                  </li>
                ))}
              </ul>
            )}

            <div className="admin-form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </form>
    </div>,
    document.body,
  );
}
