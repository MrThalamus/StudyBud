import { useState } from "react";
import type { Topic } from "../types";
import "./TopicsSidebar.css";

interface TopicsSidebarProps {
  topics: Topic[];
  active: string;
  onSelect: (name: string) => void;
}

const VISIBLE_COUNT = 5;

export default function TopicsSidebar({
  topics,
  active,
  onSelect,
}: TopicsSidebarProps) {
  const [showAll, setShowAll] = useState(false);

  const totalRooms = topics.reduce((sum, topic) => sum + topic.room_count, 0);
  const visibleTopics = showAll ? topics : topics.slice(0, VISIBLE_COUNT);

  return (
    <aside className="topics">
      <h2 className="section-title">Browse topics</h2>

      <ul className="topics-list">
        <li>
          <button
            type="button"
            className={`topics-item ${active === "" ? "is-active" : ""}`}
            onClick={() => onSelect("")}
          >
            <span>All</span>
            <span className="topics-count">{totalRooms}</span>
          </button>
        </li>

        {visibleTopics.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              className={`topics-item ${active === topic.name ? "is-active" : ""}`}
              onClick={() => onSelect(topic.name)}
            >
              <span>{topic.name}</span>
              <span className="topics-count">{topic.room_count}</span>
            </button>
          </li>
        ))}
      </ul>

      {topics.length > VISIBLE_COUNT && (
        <button
          type="button"
          className="topics-more"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show less" : "More"}
        </button>
      )}
    </aside>
  );
}
