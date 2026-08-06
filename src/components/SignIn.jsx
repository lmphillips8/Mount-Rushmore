import { useState } from "react";

export default function SignIn({ onGuestLogin }) {
  const [name, setName] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onGuestLogin(name.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <p>Sign in to submit your answers and see everyone else's.</p>
      <a href="/api/auth/login">
        <button className="twitch-btn" style={{ marginRight: "0.6rem" }}>
          Log in with Twitch - WIP
        </button>
      </a>

      {!showGuestForm && (
        <button
          className="btn-secondary"
          onClick={() => setShowGuestForm(true)}
        >
          Continue as guest
        </button>
      )}
      {showGuestForm && (
        <form onSubmit={submitGuest} style={{ marginTop: "0.9rem" }}>
          <input
            className="guest-user-input"
            type="text"
            value={name}
            placeholder="Your name"
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "0.6rem" }}
          />
          <button
            className="btn-primary"
            type="submit"
            disabled={!name.trim() || submitting}
          >
            {submitting ? "Joining..." : "Join today's board"}
          </button>
        </form>
      )}
      {error && <p style={{ color: "#e07a5f" }}>{error}</p>}
    </div>
  );
}
