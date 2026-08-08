import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../api.js";
import Hero from "../components/Hero.jsx";
import AnswersList from "../components/AnswersList.jsx";
import AnswerForm from "../components/AnswerForm.jsx";
import Loading from "../components/Loading.jsx";
import { useUser } from "../context/UserContext.jsx";
import { rotationClass } from "../utils/colors.js";
import { formatLongDate } from "../utils/date.js";
import "../styles/pages/History.scss";

export default function History() {
  const { user } = useUser();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  // Modal state for backfilling a missed day. Kept self-contained here
  // (rather than a shared hook) so it's explicitly tied to whichever day
  // was actually clicked, not today's prompt.
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAnswers, setModalAnswers] = useState(undefined); // undefined = loading
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadHistory = () => {
    return api
      .history()
      .then((r) => {
        setHistory(r.history);
        return r.history;
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadHistory().then((h) => {
      if (h?.length) setOpenId(h[0].id);
    });
  }, []);

  const openHistoricalModal = async (day) => {
    setSelectedDay(day);
    setShowModal(true);
    setModalAnswers(undefined);
    setModalError(null);

    if (!user) return; // nothing to fetch yet — modal shows a sign-in prompt

    try {
      const result = await api.todayAnswers(day.id);
      setModalAnswers(result);
    } catch (err) {
      setModalError(err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDay(null);
  };

  const handleModalSubmit = async (answers) => {
    setModalSubmitting(true);
    setModalError(null);
    try {
      await api.submitAnswers(selectedDay.id, answers);
      const fresh = await api.todayAnswers(selectedDay.id);
      setModalAnswers(fresh);
      await loadHistory(); // refresh the accordion so the new answer shows up
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="page history">
      <Hero
        color="gold"
        title="Past Mount Rushmores"
        subtitle="See previous Mount Rushmores and the community's answers "
      />

      {error && <p style={{ color: "#d9362e" }}>{error}</p>}
      {!history && !error && <Loading />}
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
                <AnswersList answers={day.answers} />
                <button
                  type="button"
                  className="add-history-btn"
                  onClick={() => openHistoricalModal(day)}
                >
                  Add an answer +
                </button>
              </div>
            )}
          </div>
        );
      })}

      {showModal && selectedDay && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {/* <h2 className="modal-title">
              Mount Rushmore of {selectedDay.text}
            </h2> */}

            {!user && (
              <p>
                Log in on the Today tab first, then come back to answer this
                one.
              </p>
            )}

            {user && modalAnswers === undefined && !modalError && <Loading />}

            {modalError && <p className="modal-error">{modalError}</p>}

            {user && modalAnswers && !modalAnswers.unlocked && (
              <AnswerForm
                onSubmit={handleModalSubmit}
                submitting={modalSubmitting}
                prompt={selectedDay}
              />
            )}

            {user && modalAnswers && modalAnswers.unlocked && (
              <p>You've already answered this one — nice work catching up!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
