import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";
import Hero from "../components/Hero.jsx";
import { Link } from "react-router-dom";

import { formatLongDate } from "../utils/date.js";
import "../styles/pages/Suggest.scss";
export default function Suggest() {
  const { user } = useUser();
  const [newPrompt, setNewPrompt] = useState({
    text: "",
    emoji: null,
    submittedBy: "",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");
  const emojiWrapperRef = useRef(null);

  // Pre-fill from their session name if they're logged in, but leave it
  // editable — suggesting doesn't require being logged in at all.
  useEffect(() => {
    if (user?.username) {
      setNewPrompt((prev) =>
        prev.submittedBy ? prev : { ...prev, submittedBy: user.username },
      );
    }
  }, [user]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    function handleClickOutside(e) {
      if (
        emojiWrapperRef.current &&
        !emojiWrapperRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const updateNewPrompt = (property, value) => {
    setNewPrompt((prev) => ({ ...prev, [property]: value }));
  };

  const selectEmoji = (emojiObject) => {
    updateNewPrompt("emoji", emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const submitPrompt = async (e) => {
    e.preventDefault();
    if (!newPrompt.text.trim()) return;

    setStatus("submitting");
    setError("");
    try {
      await api.suggestPrompt(newPrompt);
      setStatus("done");
      setNewPrompt({
        text: "",
        emoji: null,
        submittedBy: newPrompt.submittedBy,
      });
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="suggestion-box card">
        <p>Thanks! Your suggestion is in the queue for review.</p>
        <button className="btn-secondary" onClick={() => setStatus("idle")}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="page suggest">
      <Hero
        color="green"
        title={`Make a Suggestion`}
        subtitle="Brian will review submissions and your idea could be a future
        Mount Rushmore!"
      />
      {!user && (
        <div className="card">
          <p>Log in on the Today tab to join in and see everyone's answers.</p>
          <Link
            to="/"
            className="btn-link btn-green"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Go to Today
          </Link>
        </div>
      )}

      {user && (
        <form className="suggestion-box " onSubmit={submitPrompt}>
          <h2>Mount Rushmore of:</h2>
          <div className="row">
            <div className="emoji-field" ref={emojiWrapperRef}>
              <button
                type="button"
                className="emoji-trigger"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {newPrompt.emoji ?? "🐻"}
              </button>
              {showEmojiPicker && (
                <div className="emoji-popover">
                  <EmojiPicker lazyLoadEmojis onEmojiClick={selectEmoji} />
                </div>
              )}
            </div>
            <input
              type="text"
              className="suggestion-box"
              value={newPrompt.text}
              placeholder="overrated fast food restaurants"
              maxLength={120}
              onChange={(e) => updateNewPrompt("text", e.target.value)}
            />
          </div>

          <p>
            Submitting as <span>{newPrompt.submittedBy}</span>
          </p>

          {error && <p className="modal-error">{error}</p>}

          <button
            className="btn-primary submit-btn"
            type="submit"
            disabled={!newPrompt.text.trim() || status === "submitting"}
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}
