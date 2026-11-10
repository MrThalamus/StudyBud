const UNITS: [string, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function timeAgo(dateString: string): string {
  let seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";

  const parts: string[] = [];
  for (const [unit, size] of UNITS) {
    const count = Math.floor(seconds / size);
    if (count > 0) {
      parts.push(`${count} ${unit}${count === 1 ? "" : "s"}`);
      seconds -= count * size;
    } else if (parts.length > 0) {
      break;
    }
    if (parts.length === 2) break;
  }
  return `${parts.join(", ")} ago`;
}
