const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function mediaUrl(path: string | null): string {
  if (!path) return `${BACKEND_URL}/images/avatar.svg`;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
}
