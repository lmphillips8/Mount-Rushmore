import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";
import "../styles/components/SuggestionModal.scss";

export default function SuggestionModal({ title, onSubmit, onClose }) {
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box suggestion-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">{title}</h2>
        <div>
          <p>
            Brian will review submissions and your suggestion could be a future
            rushmore!
          </p>
          <form className="suggestion-box card" onSubmit={submitPrompt}>
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
                value={newPrompt.text}
                placeholder="foods you'd defend with your life"
                maxLength={120}
                onChange={(e) => updateNewPrompt("text", e.target.value)}
              />
            </div>

            <p>Submitting as: {user.username}</p>

            {error && <p className="modal-error">{error}</p>}

            <button
              className="btn-primary"
              type="submit"
              disabled={!newPrompt.text.trim() || status === "submitting"}
            >
              {status === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
