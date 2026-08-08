import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useToday } from "../context/useToday.js";
import Hero from "../components/Hero.jsx";
import AnswersList from "../components/AnswersList.jsx";
import ShareTemplate from "../components/Share.jsx";
import { rotationClass } from "../utils/colors.js";
import { formatLongDate } from "../utils/date.js";
import "../styles/pages/Community.scss";
import NoPrompt from "../components/NoPrompt.jsx";
import Loading from "../components/Loading.jsx";

export default function Community() {
  const {
    user,
    prompt,
    error,
    loading,
    alreadySubmitted,
    answersData,
    mySubmittedAnswers,
  } = useToday();

  if (loading) {
    if (error == "No prompt set for today! Go bother Brian") {
      return <NoPrompt color={"blue"} />;
    }
    return <Loading className="page"></Loading>;
  }

  return (
    <div className="page community">
      <Hero
        color="blue"
        eyebrow={formatLongDate(prompt.date)}
        // title={`${prompt.emoji ? prompt.emoji + " " : ""}Mount Rushmore of ${prompt.text}`}
        image={false}
      />

      {!user && (
        <div className="card">
          <p>Log in on the Today tab to join in and see everyone's answers.</p>
          <Link
            to="/"
            className="btn-link"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Go to Today
          </Link>
        </div>
      )}

      {user && !alreadySubmitted && (
        <div className="card">
          <p>
            Answer today's Mount Rushmore first to unlock the community's
            answers.
          </p>
          <Link
            to="/"
            className="btn-link"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Answer today's Mount Rushmore
          </Link>
        </div>
      )}

      {user && alreadySubmitted && (
        <>
          <h1 className="prompt-title">
            {prompt.emoji ?? ""} Mount Rushmore of {prompt.text}
          </h1>
          <div className="your-answers-card">
            <div className="your-answers-header">
              Your answers
              <ShareTemplate
                prompt={prompt}
                answers={mySubmittedAnswers?.answers || []}
              />
            </div>
            <div className="your-answers-body">
              <ul className="display-pill-list">
                {(mySubmittedAnswers?.answers || []).map((a, i) => (
                  <li key={i} className={`display-pill ${rotationClass(i)}`}>
                    <span className={`answer-pill-badge ${rotationClass(i)}`}>
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="count-divider">
            <span className="count-divider-badge">
              <Users size={14} />
              {answersData.answers.length}{" "}
              {answersData.answers.length === 1 ? "person" : "people"} answered
              today
            </span>
          </div>

          <AnswersList
            answers={answersData.answers.filter(
              (a) => a.userId !== user.userId,
            )}
          />
        </>
      )}
    </div>
  );
}
