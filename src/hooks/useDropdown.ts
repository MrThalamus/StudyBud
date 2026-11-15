import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Open/close logic for a dropdown menu:
// closes on outside click, on Escape, and when you navigate to another page.
export function useDropdown<T extends HTMLElement>() {
  const location = useLocation();
  const ref = useRef<T>(null);

  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === location.pathname;

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenPath(null);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPath(null);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpenPath(null);
  }

  function toggle() {
    setOpenPath(open ? null : location.pathname);
  }

  return { ref, open, close, toggle };
}
