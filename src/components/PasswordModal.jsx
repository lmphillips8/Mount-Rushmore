import { useState } from "react";

export default function PasswordModal({ title, onSubmit, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={password}
            placeholder="Password"
            onChange={(e) => {
              setError("");
              setPassword(e.target.value);
            }}
          />
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={!password || submitting}>
              {submitting ? "Checking..." : "Unlock"}
            </button>
          </div>
          {error && <p className="modal-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
