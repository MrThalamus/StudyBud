// Shown wherever a room has no topic (e.g. an admin deleted its topic).
// The host can fix it by editing the room.
export default function NoTopicBadge() {
  return <span className="tag tag-warning">No topic</span>;
}
