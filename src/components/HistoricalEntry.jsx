import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { usePromptAnswers } from "../context/usePromptAnswers.jsx";
import AnswerForm from "./AnswerForm.jsx";
import AnswersList from "./AnswersList.jsx";
import ShareTemplate from "./Share.jsx";
import { rotationClass } from "../utils/colors.js";
import { formatLongDate } from "../utils/date.js";

export default function HistoryEntry({ day, color, isOpen, onToggle }) {
  // Passing null while closed keeps the hook's fetch effects inert — the
  // hook itself is still called every render (required by rules of hooks),
  // it just has nothing to do until this entry is actually expanded.
  const {
    user,
    loading,
    submitting,
    error,
    alreadySubmitted,
    answersData,
    mySubmittedAnswers,
    submitAnswers,
  } = usePromptAnswers(isOpen ? day : null);

  return (
    <div className={`history-entry ${color}`}>
      <button type="button" className="history-entry-toggle" onClick={onToggle}>
        <div className="history-entry-meta">
          <span className="history-entry-date">
            <Calendar size={13} />
            {formatLongDate(day.date)}
          </span>
          <span className="history-entry-question">{day.text}</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {isOpen && (
        <div className="history-entry-body">
          {loading && <p>Loading...</p>}

          {!loading && !user && (
            <p className="empty-state">
              Log in on the Today tab to answer this one.
            </p>
          )}

          {!loading && error && <p style={{ color: "#d9362e" }}>{error}</p>}

          {!loading && user && !alreadySubmitted && (
            <AnswerForm onSubmit={submitAnswers} submitting={submitting} />
          )}

          {!loading && user && alreadySubmitted && (
            <>
              <div className="your-answers-card">
                <div className="your-answers-header">
                  Your answers
                  <ShareTemplate
                    promptText={day.text}
                    answers={mySubmittedAnswers?.answers || []}
                  />
                </div>
                <div className="your-answers-body">
                  <ul className="display-pill-list">
                    {(mySubmittedAnswers?.answers || []).map((a, i) => (
                      <li
                        key={i}
                        className={`display-pill ${rotationClass(i)}`}
                      >
                        <span
                          className={`answer-pill-badge ${rotationClass(i)}`}
                        >
                          {i + 1}
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <AnswersList
                answers={answersData.answers.filter(
                  (a) => a.userId !== user.userId,
                )}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
