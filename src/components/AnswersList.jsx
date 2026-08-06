import { useState, useEffect } from "react";
import ReactionBar from "./ReactionBar.jsx";
import { rotationClass } from "../utils/colors.js";
import { timeAgo } from "../utils/date.js";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AnswersList({ answers, reactable }) {
  const [items, setItems] = useState(answers);

  // Keep in sync if the parent re-fetches, but reaction updates below are
  // applied locally without waiting on that.
  useEffect(() => setItems(answers), [answers]);

  if (!items.length) {
    return (
      <p className="empty-state">
        Nobody else has submitted yet — check back soon.
      </p>
    );
  }

  const updateReactions = (answerId, reactions) => {
    setItems((prev) =>
      prev.map((a) => (a._id === answerId ? { ...a, reactions } : a)),
    );
  };

  return (
    <div className="answers-grid">
      {items.map((entry, personIndex) => {
        const color = rotationClass(personIndex);
        return (
          <div className={`answer-card ${color}`} key={entry._id}>
            <div className="answer-card-header">
              <div className={`answer-card-avatar ${color}`}>
                {initials(entry.username)}
              </div>
              <div>
                <div className="answer-card-name">{entry.username}</div>
                {entry.submittedAt && (
                  <div className="answer-card-time">
                    {timeAgo(entry.submittedAt)}
                  </div>
                )}
              </div>
            </div>

            <ul className="display-pill-list">
              {entry.answers.map((a, i) => (
                <li key={i} className={`display-pill ${rotationClass(i)}`}>
                  <span className={`answer-pill-badge ${rotationClass(i)}`}>
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ul>

            <ReactionBar
              reactable={reactable}
              answerId={entry._id}
              reactions={entry.reactions || []}
              onChange={(reactions) => updateReactions(entry._id, reactions)}
            />
          </div>
        );
      })}
    </div>
  );
}
