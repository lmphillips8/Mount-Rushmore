import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../api.js";
import Hero from "../components/Hero.jsx";
import AnswersList from "../components/AnswersList.jsx";
import { rotationClass } from "../utils/colors.js";
import { formatLongDate } from "../utils/date.js";
import "../styles/pages/History.scss";
import AnswerForm from "../components/AnswerForm.jsx";
import { useToday } from "../context/useToday.js";

export default function History() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { submitting, submitAnswers } = useToday();

  useEffect(() => {
    api
      .history()
      .then((r) => {
        setHistory(r.history);
        if (r.history?.length) setOpenId(r.history[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const addHistoricalModal = () => {
    setShowModal(true);
  };

  return (
    <div className="page history">
      <Hero
        color="gold"
        title="Past Mount Rushmores"
        subtitle="See previous Mount Rushmores and the community's answers "
      />

      {error && <p style={{ color: "#d9362e" }}>{error}</p>}
      {!history && !error && <p>Loading...</p>}
      {history?.length === 0 && (
        <p className="empty-state">No past prompts yet.</p>
      )}

      {history?.map((day, i) => {
        const color = rotationClass(i);
        const isOpen = openId === day.id;
        return (
          <div className={`history-entry ${color}`} key={day.id}>
            <button
              type="button"
              className="history-entry-toggle"
              onClick={() => setOpenId(isOpen ? null : day.id)}
            >
              <div className="left">
                <div className="emoji">{day.emoji}</div>
                <div className="history-entry-meta">
                  <span className="history-entry-date">
                    <Calendar size={13} />
                    {formatLongDate(day.date)}
                  </span>
                  <span className="history-entry-question">
                    Mount Rushmore of {day.text}
                  </span>
                </div>
              </div>
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isOpen && (
              <div className="history-entry-body">
                <AnswersList answers={day.answers} reactable={false} />
                <button
                  className="add-history-btn"
                  onClick={() => addHistoricalModal(day.id)}
                >
                  Add an answer +
                </button>
              </div>
            )}
          </div>
        );
      })}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
          }}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{prompt.text}</h2>
            (this doesnt work yet hehe)
          </div>
        </div>
      )}
    </div>
  );
}
