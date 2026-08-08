import { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useUser } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../api.js";

function groupReactions(reactions) {
  const groups = {};
  for (const r of reactions) {
    (groups[r.emoji] ??= []).push(r);
  }
  return groups;
}

export default function ReactionBar({ answerId, reactions, onChange }) {
  const { user } = useUser();
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapperRef = useRef(null);

  const { theme } = useTheme();

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const toggle = async (emoji) => {
    if (!user || busy) return;
    setBusy(true);
    setShowPicker(false);
    try {
      const { reactions: updated } = await api.reactToAnswer(answerId, emoji);
      onChange(updated);
    } finally {
      setBusy(false);
    }
  };

  const groups = groupReactions(reactions);

  return (
    <div className="reaction-bar" ref={wrapperRef}>
      {Object.entries(groups).map(([emoji, list]) => {
        const mine = user && list.some((r) => r.userId === user.userId);
        return (
          <button
            key={emoji}
            type="button"
            className={`reaction-chip${mine ? " reaction-chip-mine" : ""}`}
            onClick={() => toggle(emoji)}
            disabled={busy}
            title={list.map((r) => r.username).join(", ")}
          >
            {emoji} {list.length}
          </button>
        );
      })}

      <button
        type="button"
        className="reaction-add"
        onClick={() => setShowPicker((s) => !s)}
        disabled={!user}
        title={user ? "Add reaction" : "Log in to react"}
      >
        +
      </button>

      {showPicker && (
        <div className="emoji-popover">
          <EmojiPicker
            lazyLoadEmojis
            onEmojiClick={(e) => toggle(e.emoji)}
            previewConfig={{ defaultCaption: "Mount Rushmore Reaction" }}
            theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
          />
        </div>
      )}
    </div>
  );
}
