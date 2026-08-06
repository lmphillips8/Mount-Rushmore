import { useState } from "react";
import { Check, Send } from "lucide-react";
import { rotationClass } from "../utils/colors.js";

export default function AnswerForm({ onSubmit, submitting, prompt }) {
  const [values, setValues] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const update = (i, val) => {
    const next = [...values];
    next[i] = val;
    setValues(next);
  };

  // "Confirmed" = has content and isn't the row currently being typed in —
  // that's when a row shows a checkmark instead of its number, and counts
  // toward the progress dots.
  const isConfirmed = (i) => values[i].trim().length > 0 && focusedIndex !== i;
  const allFilled = values.every((v) => v.trim().length > 0);

  return (
    <form
      className=""
      onSubmit={(e) => {
        e.preventDefault();
        if (allFilled) onSubmit(values);
      }}
    >
      <h1 className="prompt-title">
        {prompt.emoji ?? ""} Mount Rushmore of {prompt.text}
      </h1>
      {values.map((val, i) => {
        const color = rotationClass(i);
        const active = focusedIndex === i || val.trim().length > 0;
        const confirmed = isConfirmed(i);
        return (
          <div
            key={i}
            className={`answer-pill-row${active ? ` answer-pill-row-active ${color}` : ""}`}
          >
            <span className={`answer-pill-badge ${color}`}>
              {confirmed ? <Check size={14} /> : i + 1}
            </span>
            <input
              type="text"
              value={val}
              placeholder={`Answer #${i + 1}`}
              maxLength={80}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              onChange={(e) => update(i, e.target.value)}
            />
          </div>
        );
      })}

      <div className="answer-progress">
        <div className="progress-dots">
          {values.map((_, i) => (
            <span
              key={i}
              className={`progress-dot${isConfirmed(i) ? ` ${rotationClass(i)}` : ""}`}
            />
          ))}
        </div>
        <button
          className="btn-primary submit-btn"
          type="submit"
          disabled={!allFilled || submitting}
        >
          {submitting ? "Submitting..." : "Submit my answers"}
          <Send size={15} />
        </button>
      </div>
    </form>
  );
}
