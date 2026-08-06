import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { api } from "../api.js";
import { todayEastern } from "../utils/date.js";
import PasswordModal from "../components/PasswordModal.jsx";
import "../styles/pages/Admin.scss";

function nextOpenDate(upcoming) {
  // Suggest the day after the latest already-scheduled prompt, or today
  // (in Eastern time, matching how the backend decides what "today" is —
  // not the browser's local timezone).
  const dates = upcoming.map((p) => p.date).sort();
  if (!dates.length) return todayEastern();
  const base = new Date(dates[dates.length - 1] + "T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

function SuggestionRow({
  suggestion,
  defaultDate,
  takenDates,
  onSchedule,
  onReject,
}) {
  const [date, setDate] = useState(defaultDate);
  const [busy, setBusy] = useState(false);
  const dateTaken = takenDates.has(date);

  return (
    <div className="queue-row card">
      <div className="queue-row-text">
        <span className="queue-emoji">{suggestion.emoji || "🐻"}</span>
        <div>
          {suggestion.text}
          <div className="queue-submitted-by">
            — {suggestion.submittedBy || "Anonymous"}
          </div>
        </div>
      </div>
      <div className="queue-row-actions">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="btn-primary"
          disabled={busy || dateTaken}
          onClick={async () => {
            setBusy(true);
            await onSchedule(suggestion._id, date);
            setBusy(false);
          }}
        >
          Schedule
        </button>
        <button
          className="btn-secondary btn-delete"
          disabled={busy}
          onClick={async () => {
            if (
              !window.confirm("Delete this suggestion? This can't be undone.")
            )
              return;
            setBusy(true);
            await onReject(suggestion._id);
            setBusy(false);
          }}
        >
          🗑️
        </button>
      </div>
      {dateTaken && (
        <p className="modal-error">Already a prompt scheduled for {date}.</p>
      )}
    </div>
  );
}

function CreatePromptForm({ takenDates, defaultDate, onCreate }) {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState(null);
  const [date, setDate] = useState(defaultDate);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiWrapperRef = useRef(null);

  const dateTaken = takenDates.has(date);

  // defaultDate shifts whenever the queue changes (e.g. after adding a
  // prompt, nextOpenDate recalculates) — useState's initial value only
  // applies on first mount, so without this the field would silently stay
  // on a now-stale (often already-taken) date.
  useEffect(() => {
    setDate(defaultDate);
  }, [defaultDate]);

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

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || dateTaken) return;
    setBusy(true);
    setError("");
    try {
      await onCreate({ text: text.trim(), emoji, date });
      setText("");
      setEmoji(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <div className="row">
        <div className="emoji-field" ref={emojiWrapperRef}>
          <button
            type="button"
            className="emoji-trigger"
            onClick={() => setShowEmojiPicker((s) => !s)}
          >
            {emoji ?? "🐻"}
          </button>
          {showEmojiPicker && (
            <div className="emoji-popover">
              <EmojiPicker
                lazyLoadEmojis
                onEmojiClick={(e) => {
                  setEmoji(e.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would your perfect...?"
          maxLength={120}
        />
      </div>
      <div className="queue-row-actions" style={{ marginTop: "0.75rem" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={!text.trim() || dateTaken || busy}
        >
          {busy ? "Adding..." : "Add prompt"}
        </button>
      </div>
      {dateTaken && (
        <p className="modal-error">Already a prompt scheduled for {date}.</p>
      )}
      {error && <p className="modal-error">{error}</p>}
    </form>
  );
}

export default function Admin() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    const data = await api.adminQueue();
    setQueue(data);
  }, []);

  useEffect(() => {
    api.adminMe().then((r) => {
      setIsAdmin(r.isAdmin);
      setChecking(false);
      if (r.isAdmin) loadQueue();
    });
  }, [loadQueue]);

  const handleLogin = async (password) => {
    await api.adminLogin(password);
    setIsAdmin(true);
    setShowModal(false);
    loadQueue();
  };

  const handleSchedule = async (id, date) => {
    try {
      await api.schedulePrompt(id, date);
      await loadQueue();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    await api.rejectSuggestion(id);
    await loadQueue();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheduled prompt? This can't be undone."))
      return;
    await api.deletePrompt(id);
    await loadQueue();
  };

  const handleCreate = async (data) => {
    await api.createPrompt(data);
    await loadQueue();
  };

  if (checking) {
    return <div className="page">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="eyebrow">Admin</div>
        <h1>This area is locked.</h1>
        <div className="card">
          <p>
            Enter the admin password to review suggestions and schedule prompts.
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Enter password
          </button>
        </div>
        <p>
          <Link to="/">← Back home</Link>
        </p>
        {showModal && (
          <PasswordModal
            title="Admin login"
            onSubmit={handleLogin}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    );
  }

  const suggestions = queue?.suggestions ?? [];
  const upcoming = queue?.upcoming ?? [];
  const defaultDate = nextOpenDate(upcoming);
  // today's prompt is deliberately excluded from `upcoming` (it's live, not
  // upcoming) but it's still a taken date as far as scheduling goes.
  const takenDates = new Set([todayEastern(), ...upcoming.map((p) => p.date)]);

  return (
    <div className="page">
      <div className="user-bar">
        <span className="eyebrow">Admin</span>
        <nav className="nav-links">
          <Link to="/">Today</Link>
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              await api.adminLogout();
              setIsAdmin(false);
            }}
          >
            Log out
          </a>
        </nav>
      </div>
      <h1>Prompt queue</h1>

      {error && <p className="modal-error">{error}</p>}

      <div className="eyebrow" style={{ marginTop: "1.5rem" }}>
        Suggestions ({suggestions.length})
      </div>
      {suggestions.length === 0 && (
        <p className="empty-state">No pending suggestions right now.</p>
      )}
      {suggestions.map((s) => (
        <SuggestionRow
          key={s._id}
          suggestion={s}
          defaultDate={defaultDate}
          takenDates={takenDates}
          onSchedule={handleSchedule}
          onReject={handleReject}
        />
      ))}

      <div className="eyebrow" style={{ marginTop: "2rem" }}>
        Upcoming ({upcoming.length})
      </div>
      {upcoming.length === 0 && (
        <p className="empty-state">
          Nothing scheduled yet — approve a suggestion above.
        </p>
      )}
      {upcoming.map((p) => (
        <div className="queue-row card" key={p._id}>
          <div className="queue-row-text">
            <span className="queue-emoji">{p.emoji || "🐻"}</span>
            {p.text}
          </div>
          <div className="queue-row-actions">
            <div className="queue-date-badge">{p.date}</div>
            <button
              type="button"
              className="icon-btn-delete"
              title="Delete this scheduled prompt"
              onClick={() => handleDelete(p._id)}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      <div className="eyebrow" style={{ marginTop: "2rem" }}>
        Add a prompt directly
      </div>
      <CreatePromptForm
        takenDates={takenDates}
        defaultDate={defaultDate}
        onCreate={handleCreate}
      />
    </div>
  );
}
